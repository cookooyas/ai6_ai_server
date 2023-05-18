import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateGenreDto } from '../../dto/update-genre.dto';
import { CreateGenreDto } from '../../dto/create-genre.dto';
import { GetGenreInfoDto } from '../../dto/get-genre-info.dto';
import { music_genre } from '@prisma/client';
import { ERROR_MESSAGE } from '../../util/error';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async isDuplicated(name): Promise<void> {
    const found: music_genre = await this.prisma.music_genre.findUnique({
      where: { name },
    });
    if (found) {
      throw new HttpException(
        ERROR_MESSAGE.CONFLICT.GENRE,
        HttpStatus.CONFLICT,
      );
    }
    return;
  }

  async getAll(): Promise<GetGenreInfoDto[]> {
    const genres: GetGenreInfoDto[] = await this.prisma.music_genre.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return genres;
  }

  async getOne(id: number): Promise<GetGenreInfoDto> {
    const genre: GetGenreInfoDto = await this.prisma.music_genre.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    if (!genre) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.GENRE,
        HttpStatus.NOT_FOUND,
      );
    }
    return genre;
  }

  async create(genreData: CreateGenreDto): Promise<void> {
    await this.isDuplicated(genreData.name);
    await this.prisma.music_genre.create({ data: genreData });
    return;
  }

  async patch(id: number, updateData: UpdateGenreDto): Promise<void> {
    await this.getOne(id);
    await this.isDuplicated(updateData.name);
    await this.prisma.music_genre.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number): Promise<void> {
    await this.getOne(id);
    await this.prisma.music_genre.delete({ where: { id } });
    return;
  }
}
