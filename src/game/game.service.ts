import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CHECK_POINTS,
  CHECK_POINTS_LENGTH,
  DEGREE_STANDARD,
  KEYPOINT,
  PAGINATION,
} from '../util/constants';
import { MusicService } from '../music/music.service';
import { earnXP, theRank } from '../util/rankFunc';
import {
  degreeByTheta,
  degreeToTheta,
  vectorToTheta,
} from '../util/calculateFunc';
import {
  music_answer,
  music_answer_sheet,
  user_info,
  user_score,
  user_score_detail,
} from '@prisma/client';
import { ERROR_MESSAGE } from '../util/error';
import { GetMusicInfoDto } from '../dto/get-music-info.dto';

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

    // soft-delete한 유저의 랭킹을 안 보여주고 싶은 거 처리해주는 로직 추후 추가
    const rankings = await Promise.all(
      data.map(async (d, index) => {
        const { nickname, profile_image_url, xp } =
          await this.prisma.user_info.findFirst({
            where: { user_id: d.user_id },
          });
        return {
          id: d.user_id,
          nickname,
          profile_image_url,
          xp,
          score: d._max.score,
          rank: index + 1,
        };
      }),
    );
    return rankings;
  }

  async getAnswer(id: number) {
    await this.music.getOne(id);

    const answer: music_answer = await this.prisma.music_answer.findUnique({
      where: { music_id: id },
    });

    const answer_sheet: music_answer_sheet =
      await this.prisma.music_answer_sheet.findUnique({
        where: { music_id: id },
      });

    if (!answer) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.ANSWER,
        HttpStatus.NOT_FOUND,
      );
    } else if (!answer_sheet) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.ANSWER_SHEET,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      video_url: answer.video_url,
      total_count: answer.total_count,
      total_score: answer.total_score,
      sheet: answer_sheet.sheet,
    };
  }

  async getScore(id: number, userId: number) {
    const score: user_score = await this.prisma.user_score.findUnique({
      where: { id },
    });
    if (!score) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.SCORE,
        HttpStatus.NOT_FOUND,
      );
    }

    const score_detail: user_score_detail =
      await this.prisma.user_score_detail.findUnique({
        where: { score_id: id },
      });
    if (!score_detail) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.SCORE_DETAIL,
        HttpStatus.NOT_FOUND,
      );
    }

    const user: user_info = await this.prisma.user_info.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.USER,
        HttpStatus.NOT_FOUND,
      );
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

  async saveScore(id: number, userId: number, playData): Promise<number> {
    const { score, perfect, great, good, normal, miss, rank, delta_xp } =
      await this.calculateScore(id, playData, true);

    const found: GetMusicInfoDto = await this.music.getOne(id);

    const new_score: user_score = await this.prisma.user_score.create({
      data: {
        music_id: id,
        user_id: userId,
        score,
        rank,
        delta_xp,
      },
    });

    const user: user_info = await this.prisma.user_info.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.USER,
        HttpStatus.NOT_FOUND,
      );
    }

    const xp: number = user.xp + delta_xp;
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

    return new_score.id;
  }

  async calculateScore(id: number, playData, isUser: boolean) {
    const { sheet } = await this.prisma.music_answer_sheet.findFirst({
      where: { music_id: id },
    });

    const answerList = [];
    for (let i = 1; i < playData.length; i++) {
      const p_keypoints = playData[i]['keypoints'];
      const a_idx = sheet[0]['time'] === 0 ? 2 * i : 2 * i - 1;
      const a_keypoints = sheet[a_idx]['keypoints'];

      // 점수 백분율=> 모든 노래 최고점수의 총합/
      let score = 0;
      const detail = [0, 0, 0, 0, 0]; // perfect, great, good, normal, miss
      for (let j = 0; j < CHECK_POINTS_LENGTH; j++) {
        const p_theta: number = vectorToTheta(
          p_keypoints,
          CHECK_POINTS[j][0],
          CHECK_POINTS[j][1],
        );
        const a_theta: number = vectorToTheta(
          a_keypoints,
          CHECK_POINTS[j][0],
          CHECK_POINTS[j][1],
        );

        const degree = degreeByTheta(a_theta, p_theta);
        const cos_score = Math.cos(degreeToTheta(degree));

        score = degree <= DEGREE_STANDARD.NORMAL ? (score += cos_score) : score;
        if (degree <= DEGREE_STANDARD.PERFECT) {
          detail[0] += 1;
        } else if (degree <= DEGREE_STANDARD.GREAT) {
          detail[1] += 1;
        } else if (degree <= DEGREE_STANDARD.GOOD) {
          detail[2] += 1;
        } else if (degree <= DEGREE_STANDARD.NORMAL) {
          detail[3] += 1;
        } else {
          detail[4] += 1;
        }
      }
      answerList.push({ score, detail });
    }

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

    scoreData.score = (scoreData.score / (scoreData.frame * KEYPOINT)) * 100;

    const score = scoreData.score;
    scoreData.rank = theRank(score);
    scoreData.delta_xp = earnXP(scoreData.rank);

    if (!isUser) {
      const { frame, delta_xp, ...guestScore } = scoreData;
      return { ...guestScore };
    }
    return scoreData;
  }
}
