import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSingerDto } from '../../dto/create-singer.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSingerDto } from '../../dto/update-singer.dto';
import { GetSingerInfoDto } from '../../dto/get-singer-info-dto';
import { music_singer } from '@prisma/client';

@Injectable()
export class SingerService {
  constructor(private prisma: PrismaService) {}

  async getByName(name): Promise<void> {
    const found: music_singer = await this.prisma.music_singer.findUnique({
      where: { name },
    });
    if (!found) {
      throw new NotFoundException('이미 사용 중인 이름입니다.');
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
      throw new NotFoundException('가수 정보를 찾을 수 없습니다.');
    }
    return singer;
  }

  async create(singerData: CreateSingerDto): Promise<void> {
    await this.getByName(singerData.name);
    await this.prisma.music_singer.create({ data: singerData });
    return;
  }

  async patch(id: number, updateData: UpdateSingerDto): Promise<void> {
    await this.getOne(id);
    await this.getByName(updateData.name);
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
