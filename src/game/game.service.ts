import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGINATION } from '../util/constants';
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

  async getScore(id: number) {
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

    return {
      score: score.score,
      score_rank: score.rank,
      perfect: score_detail.perfect,
      good: score_detail.good,
      miss: score_detail.miss,
    };
  }

  // 프론트가 건네준 사용자 kp 데이터로 scoring 연산하기... 연산한 다음에 동시에 저장해주는 api
  // 근데 하나씩 보내주는 거면은..? 음 그럼 어떻게 하지???????
  async saveScore(id: number, userId: number, scoreData) {
    // CreateScoreDto 아직 정의 안 함 : 나중에 해주기
    const found = await this.music.getOne(id);

    const new_score = await this.prisma.user_score.create({
      data: {
        music_id: id,
        user_id: userId,
        score: scoreData.score,
        rank: scoreData.rank,
      },
    });

    await this.prisma.user_score_detail.create({
      data: {
        score_id: new_score.id,
        perfect: scoreData.perfect,
        good: scoreData.good,
        miss: scoreData.miss,
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

  async calculateScore(id: number, playData) {
    // scoring하는 로직? 계산해서 나온 값을 result라고 하고..
    // this.getScore(id, result) => 유저이면, 낫유저이면..
    console.log(new Date());
    const { sheet } = await this.prisma.music_answer_sheet.findFirst({
      where: { music_id: id },
    });
    // console.log(sheet);
    // console.log(data.length);
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
      // for문으로 time이 1인 시점 부터 슬라이싱?=> aKP/pKP
      // p-> time =0
      // a-> time =0?0.5
      // time === 1 시작
      console.log(playData[i]['time']);
      console.log(sheet[a_idx]['time']);

      // 점수 백분율=> 모든 노래 최고점수의 총합/
      let score = 0;
      const detail = [0, 0, 0];
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
        ); //2초단위로 점수를 머리나 상단에 띄운다해요 지금 연산이랑 양이 비슷해요 21*10*2++ db await =>0.08초 0.1초마다 모아서 보내는게 힘들거같다 0.5초단위로 모은걸 보내주겟다 => 4*10*2++db await => ??
        const degree = Math.abs(a_theta - p_theta);
        if (degree < 10) {
          console.log('perfect');
          score += 1;
          detail[0] += 1;
        } else if (degree < 20) {
          console.log('good');
          score += 0.5;
          detail[1] += 1;
        } else {
          console.log('miss');
          detail[2] += 1;
        }
      }
      answerList.push({ score, detail });
    }
    console.log(new Date());

    const scoreData = answerList.reduce(
      (acc, cur) => {
        acc.score += cur.score;
        acc.perfect += cur.detail[0];
        acc.good += cur.detail[1];
        acc.miss += cur.detail[2];
        acc.frame += 1;
        return acc;
      },
      {
        score: 0,
        perfect: 0,
        good: 0,
        miss: 0,
        frame: 0,
        rank: 'C',
      },
    );

    scoreData.score = (scoreData.score / (scoreData.frame * 10)) * 100;

    // C, B, A, S, SSS
    // 0~59, 60~79, 80~89, 90~99, 100
    const score = scoreData.score;
    scoreData.rank =
      score == 100
        ? 'SSS'
        : score >= 90
        ? 'S'
        : score >= 80
        ? 'A'
        : score >= 60
        ? 'B'
        : 'C';

    return scoreData;

    // return this.saveScore(id, userId, scoreData);
  }
}
