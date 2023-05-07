import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  getAll() {
    return this.musicService.getAll();
  }

  @Get('?sort')
  getAllBySort(@Query('sort') sort: string) {
    return this.musicService.getAll();
  }

  @Get(':musicId')
  getOne(@Param('musicId') id: number) {
    return this.musicService.getOne(id);
  }

  @Post()
  create(@Body() musicData: CreateMusicDto) {
    return 'Body에 담긴 정보를 토대로 노래를 추가합니다.';
  }

  @Patch(':musicId')
  patch(@Param('musicId') id: number, @Body() updateData: UpdateMusicDto) {
    return this.musicService.patch(id, updateData);
  }

  @Delete(':musicId')
  remove(@Param('musicId') id: number) {
    return this.musicService.remove(id);
  }

  @Patch('like/:musicId')
  like(@Param('musicId') id: number) {
    return this.musicService.like(id);
  }

  @Delete('like/:musicId')
  unlike(@Param('musicId') id: number) {
    return this.musicService.unlike(id);
  }

  // 게임 플레이시 played +1 해주는 로직은 game에 작성하면 되나?
}
