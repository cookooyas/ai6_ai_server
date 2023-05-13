import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSingerDto } from '../../dto/create-singer.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSingerDto } from '../../dto/update-singer.dto';
import { GetSingerInfoDto } from '../../dto/get-singer-info-dto';

@Injectable()
export class SingerService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
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

  async getOne(id: number) {
    const singer: GetSingerInfoDto = await this.prisma.music_singer.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
    // 에러 처리 나중에 미들웨어로 구현, 에러코드표도 작성하기
    if (!singer) {
      throw new NotFoundException('가수 정보를 찾을 수 없습니다.');
    }
    return singer;
  }

  async create(singerData: CreateSingerDto) {
    // const found = this.prisma.music_singer.findUnique({where: {name: singerData.name}})
    await this.prisma.music_singer.create({ data: singerData });
    return;
  }

  async patch(id: number, updateData: UpdateSingerDto) {
    await this.getOne(id);
    await this.prisma.music_singer.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number) {
    await this.getOne(id);
    await this.prisma.music_singer.delete({ where: { id } });
    return;
  }
}
