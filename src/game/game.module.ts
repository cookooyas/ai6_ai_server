import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MusicModule } from '../music/music.module';

@Module({
  imports: [PrismaModule, MusicModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
