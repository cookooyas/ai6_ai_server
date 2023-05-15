import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMusicDto } from '../dto/update-music.dto';
import { PAGINATION } from '../util/constants';
import { CreateMusicDto } from '../dto/create-music.dto';
import { GetMusicListDto } from '../dto/get-music-list-dto';
import { GetMusicInfoDto } from '../dto/get-music-info.dto';
import { music, user_likes } from '@prisma/client';

@Injectable()
export class MusicService {
  constructor(private prisma: PrismaService) {}

  async getAll(sort: string, page: number) {
    const count: number = await this.prisma.music.count({
      where: { deleted_at: null },
    });
    const maxPage: number = Math.ceil(count / PAGINATION.DEFAULT_PER_PAGE);
    page = page < 1 ? 1 : Math.min(page, maxPage);

    let musics: GetMusicListDto[];
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
          // 페이지네이션 차후 재구현
          // skip: (page - 1) * PAGINATION.DEFAULT_PER_PAGE,
          // take: PAGINATION.DEFAULT_PER_PAGE,
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
          // skip: (page - 1) * PAGINATION.DEFAULT_PER_PAGE,
          // take: PAGINATION.DEFAULT_PER_PAGE,
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
          // skip: (page - 1) * PAGINATION.DEFAULT_PER_PAGE,
          // take: PAGINATION.DEFAULT_PER_PAGE,
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
          // skip: (page - 1) * PAGINATION.DEFAULT_PER_PAGE,
          // take: PAGINATION.DEFAULT_PER_PAGE,
        });
        break;
    }
    return musics;
  }

  async getOne(id: number) {
    const musicInfo: GetMusicInfoDto = await this.prisma.music.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        music_genre: { select: { id: true, name: true } },
        music_singer: { select: { id: true, name: true } },
        album_image_url: true,
        description: true,
        likes: true,
        played: true,
      },
    });
    // 나중에 에러처리 따로 빼주기
    if (!musicInfo) {
      throw new NotFoundException('해당 곡 정보를 찾을 수 없습니다.');
    }
    return musicInfo;
  }

  async searchMusic(search: string) {
    const musics: GetMusicListDto[] = await this.prisma.music.findMany({
      orderBy: { created_at: 'desc' },
      where: {
        deleted_at: null,
        name: {
          contains: search,
        },
      },
      select: {
        id: true,
        name: true,
        music_genre: { select: { id: true, name: true } },
        music_singer: { select: { id: true, name: true } },
        album_image_url: true,
      },
    });
    return musics;
  }

  async create(musicData: CreateMusicDto) {
    const { video_url, sheet, total_count, total_score, ...musicInfo } =
      musicData;

    // 같은 가수의 같은 곡이 생기면 곤란
    const found: music = await this.prisma.music.findFirst({
      where: { name: musicInfo.name, singer_id: musicInfo.singer_id },
    });
    if (found) {
      // NotFound가 아니라 중복이 겹쳐서 생기는 오류인데 어떻게 명명해야 할까?
      throw new NotFoundException('같은 곡의 정보가 존재합니다.');
    }

    const music: music = await this.prisma.music.create({ data: musicInfo });
    await this.prisma.music_answer.create({
      data: {
        music_id: music.id,
        video_url,
        total_count,
        total_score,
      },
    });
    await this.prisma.music_answer_sheet.create({
      data: {
        music_id: music.id,
        sheet,
      },
    });
    return;
  }

  async patch(id: number, updateData: UpdateMusicDto) {
    await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number) {
    const musicInfo: GetMusicInfoDto = await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        name: musicInfo.name + ':' + new Date(),
      },
    });
    return;
  }

  async like(id: number, user_id: number) {
    await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
    await this.prisma.user_likes.create({
      data: {
        user_id,
        music_id: id,
      },
    });
    return;
  }

  async unlike(id: number, user_id: number) {
    await this.getOne(id);
    await this.prisma.music.update({
      where: { id },
      data: { likes: { decrement: 1 } },
    });
    await this.prisma.user_likes.deleteMany({
      where: { user_id, music_id: id },
    });
    return;
  }

  async islike(id: number, user_id: number) {
    const found: user_likes = await this.prisma.user_likes.findFirst({
      where: { music_id: id, user_id },
    });
    return !!found;
  }
}
