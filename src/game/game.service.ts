import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGINATION, XP } from '../util/constants';
import { GetGameRankListDto } from '../dto/get-game-rank-list.dto';
import { MusicService } from '../music/music.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService, private music: MusicService) {}

  async rankingByMusic(id: number, top: number) {
    top = top < PAGINATION.DEFAULT_TOP ? PAGINATION.DEFAULT_TOP : top;

    const data = await this.prisma.user_score.groupBy({
      by: ['user_id'],
      _max: { score: true },
      where: { music_id: id },
      orderBy: { _max: { score: 'desc' } },
      take: top,
    });

    // 근데 soft-delete한 유저의 랭킹을 안 보여주고 싶은 건 map에서 어떻게 처리해야 하지?? 일단 null로 두고, 다시 map으로 봐야 하나?
    const rankings = await Promise.all(
      data.map(async (d, index) => {
        const { nickname, profile_image_url } =
          await this.prisma.user_info.findFirst({
            where: { user_id: d.user_id },
          });
        return {
          id: d.user_id,
          nickname,
          profile_image_url,
          score: d._max.score,
          rank: index + 1,
        };
      }),
    );
    return rankings;
  }

  async myBestScoreByMusic(id: number, userId: number) {
    const found = await this.prisma.user_score.findMany({
      where: { music_id: id, user_id: userId },
      orderBy: { score: 'desc', created_at: 'asc' },
    });

    if (!found) {
      throw new NotFoundException('플레이 정보가 존재하지 않습니다.');
    }

    const data = await this.prisma.user_score.groupBy({
      by: ['user_id'],
      _max: { score: true },
      where: { music_id: id },
      orderBy: { _max: { score: 'desc' } },
    });

    const myRank = data.findIndex(value => value.user_id === userId) + 1;

    const detail = await this.prisma.user_score_detail.findUnique({
      where: { score_id: found[0].id },
    });

    return {
      user_rank: myRank,
      score: found[0].score,
      score_rank: found[0].rank,
      perfect: detail.perfect,
      good: detail.good,
      miss: detail.miss,
    };
  }

  async getAnswer(id: number) {
    await this.music.getOne(id);

    const answer = await this.prisma.music_answer.findUnique({
      where: { music_id: id },
    });

    const answer_sheet = await this.prisma.music_answer_sheet.findUnique({
      where: { music_id: id },
    });

    if (!answer) {
      throw new NotFoundException('정답 영상이 존재하지 않습니다.');
    } else if (!answer_sheet) {
      throw new NotFoundException('정답 관절 정보가 존재하지 않습니다.');
    }

    return {
      video_url: answer.video_url,
      total_count: answer.total_count,
      total_score: answer.total_score,
      sheet: answer_sheet.sheet,
    };
  }

  async getScore(id: number, userId: number) {
    const score = await this.prisma.user_score.findUnique({
      where: { id },
    });
    if (!score) {
      throw new NotFoundException('플레이 정보가 존재하지 않습니다.');
    }

    const score_detail = await this.prisma.user_score_detail.findUnique({
      where: { score_id: id },
    });
    if (!score_detail) {
      throw new NotFoundException('플레이 정보가 존재하지 않습니다.');
    }

    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('유저 정보가 존재하지 않습니다.');
    }

    return {
      score: score.score,
      rank: score.rank,
      perfect: score_detail.perfect,
      great: score_detail.great,
      good: score_detail.good,
      normal: score_detail.normal,
      miss: score_detail.miss,
      delta_xp: score.delta_xp,
      xp: user.xp,
    };
  }

  async saveScore(id: number, userId: number, playData) {
    const { score, perfect, great, good, normal, miss, rank, delta_xp } =
      await this.calculateScore(id, playData, true);

    // CreateScoreDto 아직 정의 안 함 : 나중에 해주기
    const found = await this.music.getOne(id);

    const new_score = await this.prisma.user_score.create({
      data: {
        music_id: id,
        user_id: userId,
        score,
        rank,
        delta_xp,
      },
    });

    // xp 체인지용
    const user = await this.prisma.user_info.findUnique({
      where: { id: userId },
    });

    const xp = user.xp + delta_xp;
    console.log('xp: ', xp);
    await this.prisma.user_info.update({
      where: { id: userId },
      data: { xp },
    });

    await this.prisma.user_score_detail.create({
      data: {
        score_id: new_score.id,
        perfect,
        great,
        good,
        normal,
        miss,
      },
    });

    await this.prisma.user_play_log.create({
      data: { user_id: userId, music_id: id },
    });

    await this.prisma.music.update({
      where: { id },
      data: { played: found.played + 1 },
    });

    return new_score.id; // scoreId가 필요한 방향으로 가면 리턴해주기
  }

  async calculateScore(id: number, playData, isUser: boolean) {
    const { sheet } = await this.prisma.music_answer_sheet.findFirst({
      where: { music_id: id },
    });

    function cartesianToCylindrical(x, y) {
      const theta = Math.atan2(y, x);
      return (theta * 180) / Math.PI;
    }
    function vectorToTheta(KP, a, b) {
      const v_x = KP[a].x - KP[b].x;
      const v_y = KP[a].y - KP[b].y;
      const theta = cartesianToCylindrical(v_x, v_y);
      return theta;
    }
    const CHECK_POINTS = [
      [5, 7],
      [7, 9],
      [6, 8],
      [8, 10],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [9, 15],
      [10, 16],
    ];
    const answerList = [];
    for (let i = 1; i < playData.length; i++) {
      const p_keypoints = playData[i]['keypoints'];
      const a_idx = sheet[0]['time'] === 0 ? 2 * i : 2 * i - 1;
      const a_keypoints = sheet[a_idx]['keypoints'];

      // 점수 백분율=> 모든 노래 최고점수의 총합/
      let score = 0;
      const detail = [0, 0, 0, 0, 0]; // perfect, great, good, normal, miss
      for (let j = 0; j < CHECK_POINTS.length; j++) {
        const p_theta = vectorToTheta(
          p_keypoints,
          CHECK_POINTS[j][0],
          CHECK_POINTS[j][1],
        );
        const a_theta = vectorToTheta(
          a_keypoints,
          CHECK_POINTS[j][0],
          CHECK_POINTS[j][1],
        );

        const degree = Math.abs(a_theta - p_theta);
        const cos_score = Math.cos((Math.PI / 180) * degree);

        score = degree <= 70 ? (score += cos_score) : score;
        if (degree <= 10) {
          detail[0] += 1;
        } else if (degree <= 20) {
          detail[1] += 1;
        } else if (degree <= 40) {
          detail[2] += 1;
        } else if (degree <= 70) {
          detail[3] += 1;
        } else {
          detail[4] += 1;
        }
      }
      answerList.push({ score, detail });
    }
    console.log(new Date());

    const scoreData = answerList.reduce(
      (acc, cur) => {
        acc.score += cur.score;
        acc.perfect += cur.detail[0];
        acc.great += cur.detail[1];
        acc.good += cur.detail[2];
        acc.normal += cur.detail[3];
        acc.miss += cur.detail[4];
        acc.frame += 1;
        return acc;
      },
      {
        score: 0,
        perfect: 0,
        great: 0,
        good: 0,
        normal: 0,
        miss: 0,
        rank: 'C',
        frame: 0,
        delta_xp: 0,
      },
    );

    const KEYPOINTS = 10;
    scoreData.score = (scoreData.score / (scoreData.frame * KEYPOINTS)) * 100;

    const score = scoreData.score;

    scoreData.rank =
      score >= 95
        ? 'SSS'
        : score >= 90
        ? 'S'
        : score >= 80
        ? 'A'
        : score >= 70
        ? 'B'
        : score >= 60
        ? 'C'
        : score >= 40
        ? 'D'
        : 'F';
    scoreData.delta_xp = XP[scoreData.rank];

    if (!isUser) {
      const { frame, delta_xp, ...guestScore } = scoreData;
      return { ...guestScore };
    }
    return scoreData;
  }
}
