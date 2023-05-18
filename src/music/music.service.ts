import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMusicDto } from '../dto/update-music.dto';
// import { PAGINATION } from '../util/constants';
import { CreateMusicDto } from '../dto/create-music.dto';
import { GetMusicListDto } from '../dto/get-music-list-dto';
import { GetMusicInfoDto } from '../dto/get-music-info.dto';
import { music, user_likes } from '@prisma/client';
import { ERROR_MESSAGE } from '../util/error';

@Injectable()
export class MusicService {
  constructor(private prisma: PrismaService) {}

  async getAll(sort: string, page: number): Promise<GetMusicListDto[]> {
    // const count: number = await this.prisma.music.count({
    //   where: { deleted_at: null },
    // });
    // const maxPage: number = Math.ceil(count / PAGINATION.DEFAULT_PER_PAGE);
    // page = page < 1 ? 1 : Math.min(page, maxPage);

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

  async getOne(id: number): Promise<GetMusicInfoDto> {
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
    if (!musicInfo) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.MUSIC,
        HttpStatus.NOT_FOUND,
      );
    }
    return musicInfo;
  }

  async searchMusic(search: string): Promise<GetMusicListDto[]> {
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

  async isDuplicated(name, singer_id): Promise<void> {
    const found: music = await this.prisma.music.findFirst({
      where: { name, singer_id },
    });
    if (found) {
      throw new HttpException(
        ERROR_MESSAGE.CONFLICT.MUSIC,
        HttpStatus.CONFLICT,
      );
    }
    return;
  }

  async create(musicData: CreateMusicDto): Promise<void> {
    const { video_url, sheet, total_count, total_score, ...musicInfo } =
      musicData;

    await this.isDuplicated(musicInfo.name, musicInfo.singer_id);

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

  async patch(id: number, updateData: UpdateMusicDto): Promise<void> {
    await this.getOne(id);
    await this.isDuplicated(updateData.name, updateData.singer_id);
    await this.prisma.music.update({
      where: { id },
      data: updateData,
    });
    return;
  }

  async remove(id: number): Promise<void> {
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

  async isInLikeList(user_id, music_id): Promise<boolean> {
    const found: user_likes = await this.prisma.user_likes.findFirst({
      where: { user_id, music_id },
    });
    return !!found;
  }

  async like(id: number, user_id: number): Promise<void> {
    await this.getOne(id);
    if (await this.isInLikeList(user_id, id)) {
      throw new HttpException(ERROR_MESSAGE.CONFLICT.LIKE, HttpStatus.CONFLICT);
    }
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

  async unlike(id: number, user_id: number): Promise<void> {
    await this.getOne(id);
    if (!(await this.isInLikeList(user_id, id))) {
      throw new HttpException(
        ERROR_MESSAGE.NOT_FOUND.LIKE,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.prisma.music.update({
      where: { id },
      data: { likes: { decrement: 1 } },
    });
    await this.prisma.user_likes.deleteMany({
      where: { user_id, music_id: id },
    });
    return;
  }

  async islike(id: number, user_id: number): Promise<boolean> {
    const found: user_likes = await this.prisma.user_likes.findFirst({
      where: { music_id: id, user_id },
    });
    return !!found;
  }
}
