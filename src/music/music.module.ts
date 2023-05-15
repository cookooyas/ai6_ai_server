import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GenreModule } from './genre/genre.module';
import { SingerModule } from './singer/singer.module';

@Module({
  imports: [PrismaModule, GenreModule, SingerModule],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}
