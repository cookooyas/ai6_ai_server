import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [GenreController],
  providers: [GenreService],
  imports: [PrismaModule],
})
export class GenreModule {}
