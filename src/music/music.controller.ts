import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateMusicDto } from '../dto/create-music.dto';
import { UpdateMusicDto } from '../dto/update-music.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetMusicListDto } from '../dto/get-music-list-dto';
import { GetMusicInfoDto } from '../dto/get-music-info.dto';

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
    type: [GetMusicListDto],
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
    type: GetMusicInfoDto,
  })
  @Get(':musicId')
  getOne(@Param('musicId') id: number) {
    return this.musicService.getOne(id);
  }

  @ApiOperation({
    summary: '뮤직 검색 API',
    description: '검색어를 토대로 뮤직을 검색해 조회한다.',
  })
  @ApiParam({ name: 'keyword', description: '검색어' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (없으면 빈 배열)',
    type: [GetMusicListDto],
  })
  @Get('/search/:keyword')
  searchMusic(@Param('keyword') keyword: string) {
    // 공백으로만 이루어진 문자열은 안 됨, 걸러내야 하는데... -> regex
    return this.musicService.searchMusic(keyword.trim());
  }

  // 관리자가 해야함
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
    return this.musicService.create(musicData);
  }

  // 관리자가 해야함
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

  // 관리자가 해야함
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
  @UseGuards(AuthGuard('jwt'))
  @Patch('like/:musicId')
  like(@Param('musicId') id: number, @Req() req) {
    const { user_id } = req.user;
    return this.musicService.like(id, user_id);
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
  @UseGuards(AuthGuard('jwt'))
  @Delete('like/:musicId')
  unlike(@Param('musicId') id: number, @Req() req) {
    const { user_id } = req.user;
    return this.musicService.unlike(id, user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('like/:musicId')
  islike(@Param('musicId') id: number, @Req() req) {
    const { user_id } = req.user;
    return this.musicService.islike(id, user_id);
  }

  // 게임 플레이시 played +1 해주는 로직은 game에 작성하면 되나?
}
