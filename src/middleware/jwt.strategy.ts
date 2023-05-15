import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
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
    const { user_id } = payload;

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
      where: { user_id },
    });
    const isAdmin = admin ? true : false;

    // 여기서 유저 토큰을 연장시켜주는 방법도 고려해볼만하다. 현재시간이 expired_at보다 전이고, 시간이 10분이내로 남는다면 재발급해주는 방법이 괜찮을듯 하다 커스텀 데코레이터를 만들어서 expired_in이 true일 경우에 어떠한 로직을 처리하게끔하자.
    const date = new Date();
    let expired_in = false;
    if (date < expired_at) {
      date.setSeconds(date.getDate() + 60 * 60);
      if (date > expired_at) {
        console.log('this token will be expired in 10 min');
        expired_in = true;
      }
    }
    return { user_id, isAdmin, expired_in };
  }
}
