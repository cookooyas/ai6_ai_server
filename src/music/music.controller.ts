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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetMusicList } from '../util/swaggerOkResponse/getMusicList';
import { GetMusicInfo } from '../util/swaggerOkResponse/getMusicInfo';

@Controller('music')
@ApiTags('뮤직 API')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  // 에러 코드 표 나중에 작성하기.

  @ApiOperation({
    summary: '정렬한 뮤직 리스트 조회 API',
    description: '정렬한 뮤직 리스트를 조회한다.',
  })
  @ApiQuery({
    name: 'sort',
    description:
      '정렬 키워드, 없거나 잘 못 적으면 latest로 간주, 웬만하면 enum 값으로 보낼 것',
    enum: ['latest', 'popular', 'singerABC', 'singerCBA'],
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description:
      '페이지 번호, 1보다 작은 값은 1, maxPage보다 큰 값은 maxPage로 치환',
    required: false,
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (genre는 null일 수 있다)',
    type: [GetMusicList],
  })
  @Get()
  getAll(@Query('sort') sort?: string, @Query('page') page?: number) {
    return this.musicService.getAll(sort, page ? Math.floor(page) : 1);
  }

  @ApiOperation({
    summary: '뮤직 정보 조회 API',
    description: '하나의 뮤직 정보를 조회한다.',
  })
  @ApiParam({ name: 'musicId', description: '조회할 뮤직 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (genre와 description은 null일 수 있다)',
    type: GetMusicInfo,
  })
  @Get(':musicId')
  getOne(@Param('musicId') id: number) {
    return this.musicService.getOne(id);
  }

  @ApiOperation({
    summary: '뮤직 생성 API',
    description: '보낸 정보를 토대로 뮤직 정보를 생성한다.',
  })
  @ApiBody({ type: CreateMusicDto }) // 아직 작성 안 함
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Post()
  create(@Body() musicData: CreateMusicDto) {
    return 'Body에 담긴 정보를 토대로 노래를 추가합니다.';
  }

  @ApiOperation({
    summary: '뮤직 수정 API',
    description: '보낸 정보를 토대로 뮤직 정보를 수정한다.',
  })
  @ApiParam({ name: 'musicId', description: '수정할 뮤직 id' })
  @ApiBody({ type: UpdateMusicDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Patch(':musicId')
  patch(@Param('musicId') id: number, @Body() updateData: UpdateMusicDto) {
    return this.musicService.patch(id, updateData);
  }

  @ApiOperation({
    summary: '뮤직 삭제 API',
    description: '보낸 정보를 토대로 뮤직 정보를 삭제한다.',
  })
  @ApiParam({ name: 'musicId', description: '삭제할 뮤직 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Delete(':musicId')
  remove(@Param('musicId') id: number) {
    return this.musicService.remove(id);
  }

  @ApiOperation({
    summary: '뮤직 찜 추가 API',
    description: '해당 곡의 likes를 1 증가시킨다.',
  })
  @ApiParam({ name: 'musicId', description: '찜 추가할 뮤직 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Patch('like/:musicId')
  like(@Param('musicId') id: number) {
    return this.musicService.like(id);
  }

  @ApiOperation({
    summary: '뮤직 찜 제거 API',
    description: '해당 곡의 likes를 1 감소시킨다.',
  })
  @ApiParam({ name: 'musicId', description: '찜 삭제할 뮤직 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Delete('like/:musicId')
  unlike(@Param('musicId') id: number) {
    return this.musicService.unlike(id);
  }

  // 게임 플레이시 played +1 해주는 로직은 game에 작성하면 되나?
}
