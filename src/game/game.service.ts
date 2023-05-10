import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CONSTANT } from '../util/constants';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async rankingByMusic(id: number, top: number) {
    top = top < CONSTANT.top ? CONSTANT.top : top;

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

  // async myRankingByMusic(musicId: number, userId: number) {
  //   await this.prisma.user_score_detail.findMany({
  //     // where: { musicId, userId }, // 근데 이건 user_score_detail에서 찾는 게 맞나?
  //   });
  //   return;
  // }
}
