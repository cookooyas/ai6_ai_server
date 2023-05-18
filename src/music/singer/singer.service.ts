import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSingerDto } from '../../dto/create-singer.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSingerDto } from '../../dto/update-singer.dto';
import { GetSingerInfoDto } from '../../dto/get-singer-info-dto';
import { music_singer } from '@prisma/client';
import { ERROR_MESSAGE } from '../../util/error';

@Injectable()
export class SingerService {
  constructor(private prisma: PrismaService) {}

  async isDuplicated(name): Promise<void> {
    const found: music_singer = await this.prisma.music_singer.findUnique({
      where: { name },
    });
    if (found) {
      throw new HttpException(
        ERROR_MESSAGE.CONFLICT.SINGER,
        HttpStatus.CONFLICT,
      );
    }
    return;
  }

  async getAll(): Promise<GetSingerInfoDto[]> {
    const singers: GetSingerInfoDto[] = await this.prisma.music_singer.findMany(
      {
        select: {
          id: true,
          name: true,
        },
      },
    );
    return singers;
  }

  async getOne(id: number): Promise<GetSingerInfoDto> {
    const singer: GetSingerInfoDto = await this.prisma.music_singer.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    if (!singer) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.SINGER,
        HttpStatus.NOT_FOUND,
      );
    }
    return singer;
  }

  async create(singerData: CreateSingerDto): Promise<void> {
    await this.isDuplicated(singerData.name);
    await this.prisma.music_singer.create({ data: singerData });
    return;
  }

  async patch(id: number, updateData: UpdateSingerDto): Promise<void> {
    await this.getOne(id);
    await this.isDuplicated(updateData.name);
    await this.prisma.music_singer.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number): Promise<void> {
    await this.getOne(id);
    await this.prisma.music_singer.delete({ where: { id } });
    return;
  }
}
