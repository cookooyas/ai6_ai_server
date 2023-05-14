import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserNicknameDto } from './dto/update-userNickname.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  // 사용자 프로필 조회
  async findUser(userId: number): Promise<object> {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { user_auth: true, user_info: true },
    });
    const { id, user_auth, user_info } = foundUser;
    const { nickname, profile_image_url, current_tier } = user_info;
    const { email } = user_auth;
    return { id, nickname, email, profile_image_url, current_tier };
  }

  // 사용자 닉네임 수정
  async updateUserNickname(
    userId: number,
    updateUserNicknameDto: UpdateUserNicknameDto,
  ) {
    const { nickname } = updateUserNicknameDto;
    if (
      await this.prismaService.user_info.findUnique({ where: { nickname } })
    ) {
      throw new UnauthorizedException(`${nickname} is already exist.`);
    }
    return await this.prismaService.user_info.update({
      where: { user_id: userId },
      data: {
        ...(nickname && { nickname }),
      },
    });
  }

  // 사용자 프로필 이미지 수정(업로드)
  async uploadUserProfileImage(userId: number, file: Express.MulterS3.File) {
    if (!file) {
      throw new BadRequestException('there is no files');
    }
    const filePath = file.location;
    await this.prismaService.user_info.update({
      where: { user_id: userId },
      data: {
        profile_image_url: filePath,
      },
    });
    return { filePath };
  }

  // 사용자 비밀번호 변경
  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const { current_password, new_password } = updatePasswordDto;
    const foundUserAuth = await this.prismaService.user_auth.findUnique({
      where: { user_id: userId },
    });
    if (await bcrypt.compare(current_password, foundUserAuth.password)) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(new_password, salt);
      return this.prismaService.user_auth.update({
        where: { user_id: userId },
        data: { password: hashedPassword },
      });
    } else {
      throw new UnauthorizedException('password not match');
    }
  }

  // 사용자 캘린더 조회
  async findCalendar(
    userId: number,
    year: string,
    month: string,
  ): Promise<object[]> {
    return await this.prismaService.user_play_log.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(`${year}-${+month}-01`),
          lt: new Date(
            `${+month + 1 > 12 ? +year + 1 : year}-${
              +month + 1 > 12 ? '01' : +month + 1
            }-01`,
          ),
        },
      },
      distinct: ['created_at'],
      orderBy: { created_at: 'asc' },
      select: { created_at: true },
    });
  }

  // 사용자 찜 리스트 조회
  async findLikes(userId: number, pageno: number): Promise<object[]> {
    let total_length;
    const perPage = 5;
    await this.prismaService.user_likes
      .findMany({
        where: { user_id: userId },
      })
      .then(data => (total_length = data.length));
    const maxPage = Math.ceil(total_length / perPage);
    pageno = pageno > maxPage ? maxPage : pageno;
    const userLikes = await this.prismaService.user_likes.findMany({
      where: { user_id: userId },
      ...(pageno > 0 && { take: perPage }),
      ...(pageno > 0 && { skip: (pageno - 1) * perPage }),
      include: {
        music: {
          include: { music_singer: { select: { name: true } } },
        },
      },
    });

    return userLikes;
  }

  // 최근 플레이한 리스트
  async findAllGameHistory(userId: number, pageno: number) {
    const historyList = [];
    await this.prismaService.user_score
      .groupBy({
        by: ['music_id'],
        where: { user_id: userId },
      })
      .then(async data => {
        const total_length = data.length;
        const maxPage = Math.ceil(total_length / 5);
        pageno = pageno > maxPage ? maxPage : pageno;
        for (let i = 0; i < 5; i++) {
          const idx = i + (pageno - 1) * 5;
          if (idx + 1 > data.length) break;
          const music_id = data[idx].music_id;
          const { name, album_image_url, music_singer } =
            await this.prismaService.music.findUnique({
              where: { id: music_id },
              include: { music_singer: true },
            });
          const { total_score } =
            await this.prismaService.music_answer.findUnique({
              where: { music_id },
            });
          const { score } = await this.prismaService.user_score.findFirst({
            where: { user_id: userId, music_id },
            orderBy: { score: 'desc' },
          });
          historyList.push({
            music_id,
            music_name: name,
            album_image_url,
            music_singer: music_singer.name,
            user_music_best_score: score,
            music_total_score: total_score,
          });
        }
      });
    return historyList;
  }

  // 히스토리 세부 정보
  async findOneGameHistory(userId: number, musicId: number) {
    const historyList = [];
    let result = {};

    await this.prismaService.user_score
      .findMany({
        where: { user_id: userId, music_id: musicId },
        orderBy: { score: 'desc' },
        distinct: ['created_at'],
      })
      .then(async data => {
        if (data.length > 0) {
          const { id, music_id, rank, score } = data[0];
          const { perfect, good, miss } =
            await this.prismaService.user_score_detail.findUnique({
              where: { score_id: id },
            });
          const { total_score } =
            await this.prismaService.music_answer.findUnique({
              where: { music_id },
            });
          for (let i = 0; i < data.length; i++) {
            const { score, created_at } = data[i];

            historyList.push({
              music_score: score,
              music_score_created_at: created_at,
            });
          }
          result = {
            music_id,
            music_best_score_detail: { score, rank, perfect, good, miss },
            music_total_score: total_score,
            music_score_list: historyList.sort(
              (a, b) =>
                a['music_score_created_at'] - b['music_score_created_at'],
            ),
          };
        }
      });
    return result;
  }
}
