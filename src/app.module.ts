import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MusicModule } from './music/music.module';
import { GameModule } from './game/game.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { SingerModule } from './singer/singer.module';
import { GenreModule } from './genre/genre.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MusicModule,
    GameModule,
    AdminModule,
    PrismaModule,
    SingerModule,
    GenreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
