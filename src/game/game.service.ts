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

  // musicId 말고 scoreId가 들어가야 하지 않을까? 왜냐하면 방금 플레이 한 결과 가져오는 거니까! -> 내일 프론트 분들한테 여쭤보기
  // 일단 musicId, userId를 파라미터로 받은 거 작성
  async getScore(id: number, userId: number) {
    const score = await this.prisma.user_score.findFirst({
      where: { music_id: id, user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    if (!score) {
      throw new NotFoundException('플레이 정보가 존재하지 않습니다.');
    }

    const score_detail = await this.prisma.user_score_detail.findUnique({
      where: { score_id: score.id },
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
  // // scoreId 버전
  // async getScore(id: number) {
  //   const score = await this.prisma.user_score.findUnique({
  //     where: { id },
  //   });
  //   if (!score) {
  //     throw new NotFoundException('플레이 정보가 존재하지 않습니다.');
  //   }
  //
  //   const score_detail = await this.prisma.user_score_detail.findUnique({
  //     where: { score_id: id },
  //   });
  //   if (!score_detail) {
  //     throw new NotFoundException('플레이 정보가 존재하지 않습니다.');
  //   }
  //
  //   return {
  //     score: score.score,
  //     score_rank: score.rank,
  //     perfect: score_detail.perfect,
  //     good: score_detail.good,
  //     miss: score_detail.miss,
  //   };
  // }

  //
}
