import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAGINATION } from '../util/constants';
import { GetGameRankListDto } from '../dto/get-game-rank-list.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async rankingByMusic(id: number, top: number) {
    top = top < PAGINATION.DEFAULT_TOP ? PAGINATION.DEFAULT_TOP : top;

    const data = await this.prisma.user_score.groupBy({
      by: ['user_id'],
      _max: { score: true },
      where: { music_id: id },
      orderBy: { _max: { score: 'desc' } },
      take: top,
    });

    console.log(data);

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
}
