import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { userInfo } from 'os';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

const fromAuthCookie = function () {
  return function (request) {
    let accessToken;
    if (request && request.cookies) {
      accessToken = request.cookies['AccessToken'];
      if (!accessToken) {
        throw new NotFoundException('COOKIE NOT FOUND');
      }
      return accessToken;
    }
  };
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: fromAuthCookie(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }
  async validate(payload) {
    const { email } = payload;

    const user_auth = await this.prismaService.user_auth.findFirst({
      where: { email },
    });
    if (!user_auth) {
      throw new UnauthorizedException();
    }
    const { user_id } = user_auth;
    const { deleted_at } = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (deleted_at) {
      throw new UnauthorizedException('this user was deleted');
    }
    const admin = await this.prismaService.user_admin.findUnique({
      where: { user_id },
    });
    const { expired_at } = await this.prismaService.user_token.findFirst({
      where: { user_id: user_id },
    });
    const isAdmin = admin ? true : false;
    return { user_id, isAdmin, expired_at };
  }
}
