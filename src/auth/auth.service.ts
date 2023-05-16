import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { user } from '@prisma/client';
import { AuthCredentialDto } from './dto/authCredential.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  // 회원가입 기능
  async createUser(createUserDto: CreateUserDto): Promise<user> {
    try {
      const { email, nickname, password } = createUserDto;
      if (await this.prismaService.user_auth.findFirst({ where: { email } })) {
        throw new error();
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      return await this.prismaService.user.create({
        data: {
          user_auth: {
            create: { email, password: hashedPassword, type: 'email' },
          },
          // 프로필이미지 default생김
          user_info: { create: { nickname } },
        },
      });
    } catch (error) {
      throw new ForbiddenException('join failed');
    }
  }

  // 이메일,닉네임 중복검사 기능
  async checkDuplication(type: 'email' | 'nickname', value): Promise<boolean> {
    const { email, nickname } = value;
    if (!email && !nickname) {
      throw new NotFoundException(`there is no ${type} in Body.`);
    }
    const result =
      type === 'email'
        ? await this.prismaService.user_auth.findFirst({
            where: { email },
          })
        : await this.prismaService.user_info.findUnique({
            where: { nickname },
          });
    if (!result) {
      return false;
    }
    return true;
  }

  // 로그인기능
  async signin(
    authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialDto;
    const foundUserAuth = await this.prismaService.user_auth.findFirst({
      where: { email },
      include: { user: true },
    });
    const userId = foundUserAuth.user.id;
    if (foundUserAuth.user.deleted_at) {
      throw new UnauthorizedException('this user was deleted.');
    }
    if (
      foundUserAuth &&
      (await bcrypt.compare(password, foundUserAuth.password))
    ) {
      const accessTokenPayload = { user_id: userId };
      // 원래라면 userId라던가 또 다른 정보들을 가지고 refresh토큰을 만들어줘야하지만, 지금은 잠시 고려하지않겠다.
      const accessToken = await this.jwtService.sign(accessTokenPayload);
      const date = new Date();
      date.setSeconds(date.getDate() + 3600);
      await this.prismaService.user_token.upsert({
        where: { user_id: userId },
        update: {
          refresh_token: accessToken,
          expired_at: date,
        },
        create: {
          user_id: userId,
          refresh_token: accessToken,
          expired_at: date,
        },
      });
      return { accessToken };
    } else {
      throw new UnauthorizedException('login failed');
    }
  }

  // 로그아웃 기능
  async signout(userId: number): Promise<{ message: string }> {
    const found = await this.prismaService.user_token.delete({
      where: { user_id: userId },
    });
    if (found) {
      return { message: 'signout success' };
    }
  }

  // 회원탈퇴 기능
  async leave(userId: number): Promise<{ message: string }> {
    const found = await this.prismaService.user.update({
      where: { id: userId },
      data: { deleted_at: new Date() },
    });
    if (found) {
      return { message: 'leave success' };
    }
  }

  // 사용자 비밀번호 검증
  async checkPassword(userId: number, data: any): Promise<boolean> {
    const foundUserAuth = await this.prismaService.user_auth.findUnique({
      where: { user_id: userId },
    });
    const { password } = data;
    const result = await bcrypt.compare(password, foundUserAuth.password);
    console.log(result, typeof result);
    if (await bcrypt.compare(password, foundUserAuth.password)) {
      return true;
    }
    return false;
  }

  // 토큰 재발급
  async updateToken(userId: number) {
    const accessTokenPayload = { user_id: userId };
    const accessToken = await this.jwtService.sign(accessTokenPayload);
    const date = new Date();
    date.setSeconds(date.getDate() + 3600);
    await this.prismaService.user_token.upsert({
      where: { user_id: userId },
      update: {
        refresh_token: accessToken,
        expired_at: date,
      },
      create: {
        user_id: userId,
        refresh_token: accessToken,
        expired_at: date,
      },
    });
    return { accessToken };
  }
}
