import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

const fromAuthCookie = function () {
  return function (request) {
    let accessToken;
    if (request && request.cookies) {
      accessToken = request.cookies['AccessToken'];
    }
    return accessToken;
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
    const user = await this.prismaService.user_auth.findFirst({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const { user_id } = user;
    const admin = await this.prismaService.user_admin.findUnique({
      where: { user_id },
    });
    const refreshTokenExp = await this.prismaService.user_token.findFirst({
      where: { user_id: user_id },
      select: { expired_at: true },
    });
    const isAdmin = admin ? true : false;
    return { user_id, isAdmin, refreshTokenExp };
  }
}
