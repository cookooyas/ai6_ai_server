import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSingerDto } from './dto/create-singer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { music_singer } from '@prisma/client';
import { UpdateSingerDto } from './dto/update-singer.dto';

@Injectable()
export class SingerService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const singers: music_singer[] = await this.prisma.music_singer.findMany();
    return singers;
  }

  async getOne(id: number) {
    const singer: music_singer = await this.prisma.music_singer.findUnique({
      where: { id },
    });
    // 에러 처리 나중에 미들웨어로 구현, 에러코드표도 작성하기
    if (!singer) {
      throw new NotFoundException('가수 정보를 찾을 수 없습니다.');
    }
    return singer;
  }

  async create(singerData: CreateSingerDto) {
    await this.prisma.music_singer.create({ data: singerData });
    return;
  }

  async patch(id: number, updateData: UpdateSingerDto) {
    await this.getOne(id);
    const update = await this.prisma.music_singer.update({
      where: { id },
      data: updateData,
    });
    console.log(update);
    return;
  }

  async remove(id: number) {
    await this.getOne(id);
    await this.prisma.music_singer.delete({ where: { id } });
    return;
  }
}
