import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateGenreDto } from '../../dto/create-genre.dto';
import { GenreService } from './genre.service';
import { UpdateGenreDto } from '../../dto/update-genre.dto';
import { GetGenreInfoDto } from '../../dto/get-genre-info.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('genre')
@ApiTags('장르 API')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @ApiOperation({
    summary: '장르 리스트 조회 API',
    description: '장르 리스트를 조회한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
    type: [GetGenreInfoDto],
  })
  @Get()
  getAll() {
    return this.genreService.getAll();
  }

  @ApiOperation({
    summary: '장르 정보 조회 API',
    description: '하나의 장르 정보를 조회한다.',
  })
  @ApiParam({ name: 'genreId', description: '조회할 장르 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
    type: GetGenreInfoDto,
  })
  @Get(':genreId')
  getOne(@Param('genreId') id: number) {
    return this.genreService.getOne(id);
  }

  @ApiOperation({
    summary: '장르 정보 생성 API',
    description: '하나의 장르 정보를 생성한다.',
  })
  @ApiBody({ type: CreateGenreDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Post()
  create(@Body() genreData: CreateGenreDto) {
    return this.genreService.create(genreData);
  }

  @ApiOperation({
    summary: '장르 정보 수정 API',
    description: '하나의 장르 정보를 수정한다.',
  })
  @ApiParam({ name: 'genreId', description: '수정할 장르 id' })
  @ApiBody({ type: UpdateGenreDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Patch(':genreId')
  patch(@Param('genreId') id: number, @Body() updateData: UpdateGenreDto) {
    return this.genreService.patch(id, updateData);
  }

  @ApiOperation({
    summary: '장르 정보 삭제 API',
    description: '하나의 장르 정보를 삭제한다.',
  })
  @ApiParam({ name: 'genreId', description: '삭제할 장르 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Delete(':genreId')
  remove(@Param('genreId') id: number) {
    return this.genreService.remove(id);
  }
}
