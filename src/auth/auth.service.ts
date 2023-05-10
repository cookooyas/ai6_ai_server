import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { user } from '@prisma/client';
import { AuthCredentialDto } from './dto/authCredential.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

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
      throw new UnauthorizedException('join failed');
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
    // user와 user_auth가 연결되어있을 터인데 특정 user 스키마에서 특정 foundUser에서 user.user_auth에 왜 접근할 수 없는가.
    if (foundUserAuth.user.deleted_at) {
      throw new UnauthorizedException('this user was deleted.');
    }
    if (
      foundUserAuth &&
      (await bcrypt.compare(password, foundUserAuth.password))
    ) {
      const accessTokenPayload = { email };
      // 원래라면 userId라던가 또 다른 정보들을 가지고 refresh토큰을 만들어줘야하지만, 지금은 잠시 고려하지않겠다.
      // accessToken==refreshToken
      const refreshTokenPayload = { email };
      const accessToken = await this.jwtService.sign(accessTokenPayload);
      const refreshToken = await this.jwtService.sign(refreshTokenPayload);
      await this.prismaService.user_token.create({
        data: {
          user_id: userId,
          refresh_token: refreshToken,
          expired_at: new Date(), //시간 수정할것
        },
      });
      return { accessToken };
    } else {
      throw new UnauthorizedException('login failed');
    }
  }

  // 로그아웃 기능
  async signout(userId: number): Promise<{ message: string }> {
    // 원래라면 토큰이 저장된 공간에서 해당 토큰을 가져와야한다.
    // 이후 미들웨어를 통해 처리된 유저 id를 가져와서 검증한다.
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
    console.log(foundUserAuth, data.password);
    const result = await bcrypt.compare(password, foundUserAuth.password);
    console.log(result, typeof result);
    if (await bcrypt.compare(password, foundUserAuth.password)) {
      return true;
    }
    return false;
  }
}
