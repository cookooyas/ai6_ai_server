import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [MusicController],
  providers: [MusicService],
  imports: [PrismaModule],
})
export class MusicModule {}
