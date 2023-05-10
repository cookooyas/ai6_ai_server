import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserInfoDto } from './dto/update-userInfo.dto';
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

  // 사용자 프로필 수정
  async updateUser(userId: number, updateUserInfoDto: UpdateUserInfoDto) {
    const { nickname, profile_image_url } = updateUserInfoDto;
    if (!nickname && !profile_image_url) {
      throw new NotFoundException('data Not Found');
    }
    return await this.prismaService.user_info.update({
      where: { user_id: userId },
      data: {
        ...(nickname && { nickname }),
        ...(profile_image_url && { profile_image_url }),
      },
    });
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
    console.log(userId, pageno);
    return await this.prismaService.user_likes.findMany({
      where: { user_id: userId },
      take: 5,
      skip: (pageno - 1) * 5,
      include: {
        music: {
          include: { music_singer: { select: { name: true } } },
        },
      },
    });
  }

  // 최근 플레이한 리스트
  async findAllGameHistory(userId: number, pageno: number) {
    return await this.prismaService.user_score.findMany({
      where: { user_id: userId },
      take: 5,
      skip: (pageno - 1) * 5,
      include: { music: { select: { id: true } } },
    });
  }
}
