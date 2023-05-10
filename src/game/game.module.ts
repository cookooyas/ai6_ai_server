import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [GameController],
  providers: [GameService],
  imports: [PrismaModule],
})
export class GameModule {}
