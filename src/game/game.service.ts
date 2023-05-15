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

    // return new_score.id; // scoreId가 필요한 방향으로 가면 리턴해주기
  }

  async calculateScore(id: number, playData) {
    // scoring하는 로직? 계산해서 나온 값을 result라고 하고..
    // this.getScore(id, result) => 유저이면, 낫유저이면..
    return;
  }
}
