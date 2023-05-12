import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from 'src/middleware/jwt.strategy';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
