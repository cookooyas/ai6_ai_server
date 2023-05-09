import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMusicDto } from './dto/update-music.dto';
import { CONSTANT } from '../util/constants';

@Injectable()
export class MusicService {
  constructor(private prisma: PrismaService) {}

  async getAll(sort: string, page: number) {
    const count = await this.prisma.music.count({
      where: { deleted_at: null },
    });
    const maxPage = Math.ceil(count / CONSTANT.perPage);
    page = page < 1 ? 1 : Math.min(page, maxPage);

    let musics;
    switch (sort) {
      case 'popular':
        musics = await this.prisma.music.findMany({
          orderBy: { played: 'desc' },
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            music_genre: { select: { id: true, name: true } },
            music_singer: { select: { id: true, name: true } },
            album_image_url: true,
          },
          skip: (page - 1) * CONSTANT.perPage,
          take: CONSTANT.perPage,
        });
        break;
      case 'singerABC':
        musics = await this.prisma.music.findMany({
          orderBy: { music_singer: { name: 'asc' } },
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            music_genre: { select: { id: true, name: true } },
            music_singer: { select: { id: true, name: true } },
            album_image_url: true,
          },
          skip: (page - 1) * CONSTANT.perPage,
          take: CONSTANT.perPage,
        });
        break;
      case 'singerCBA':
        musics = await this.prisma.music.findMany({
          orderBy: { music_singer: { name: 'desc' } },
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            music_genre: { select: { id: true, name: true } },
            music_singer: { select: { id: true, name: true } },
            album_image_url: true,
          },
          skip: (page - 1) * CONSTANT.perPage,
          take: CONSTANT.perPage,
        });
        break;
      default: // latest
        musics = await this.prisma.music.findMany({
          orderBy: { created_at: 'desc' },
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            music_genre: { select: { id: true, name: true } },
            music_singer: { select: { id: true, name: true } },
            album_image_url: true,
          },
          skip: (page - 1) * CONSTANT.perPage,
          take: CONSTANT.perPage,
        });
        break;
    }
    return musics;
  }

  async getOne(id: number) {
    const musicInfo = await this.prisma.music.findFirst({
      where: { id, deleted_at: null }, // findUnqiue에서 deleted_at:null 추가하면 왜 안 되지?
      select: {
        id: true,
        name: true,
        music_genre: { select: { id: true, name: true } },
        music_singer: { select: { id: true, name: true } },
        album_image_url: true,
        description: true,
        likes: true,
        played: true,
        // user_is_like는 어떻게 집어넣지??
      },
    });
    // 나중에 에러처리 따로 빼주기
    if (!musicInfo) {
      throw new NotFoundException('해당 곡 정보를 찾을 수 없습니다.');
    }
    return musicInfo;
  }

  // async create(musicData)

  async patch(id: number, updateData: UpdateMusicDto) {
    await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number) {
    const musicInfo = await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        name: musicInfo.name + ':' + new Date(),
      },
    });
    return;
  }

  async like(id: number) {
    await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
  }

  async unlike(id: number) {
    await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: { likes: { decrement: 1 } },
    });
  }
}
