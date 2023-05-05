import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MusicModule } from './music/music.module';
import { GameModule } from './game/game.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [UserModule, AuthModule, MusicModule, GameModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
