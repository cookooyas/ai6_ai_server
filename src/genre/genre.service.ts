import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { music_genre } from '@prisma/client';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { CreateGenreDto } from './dto/create-genre.dto';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const genres: music_genre[] = await this.prisma.music_genre.findMany();
    return genres;
  }

  async getOne(id: number) {
    const genre: music_genre = await this.prisma.music_genre.findFirst({
      where: { id },
    });
    // 에러 처리 나중에 미들웨어로 구현, 에러코드표도 작성하기
    if (!genre) {
      throw new NotFoundException('장르 정보를 찾을 수 없습니다.');
    }
    return genre;
  }

  async create(genreData: CreateGenreDto) {
    await this.prisma.music_genre.create({ data: genreData });
    return;
  }

  async patch(id: number, updateData: UpdateGenreDto) {
    await this.getOne(id);
    await this.prisma.music_genre.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number) {
    await this.getOne(id);
    await this.prisma.music_genre.delete({ where: { id } });
    return;
  }
}
