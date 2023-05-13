import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SingerService } from './singer.service';
import { CreateSingerDto } from '../../dto/create-singer.dto';
import { UpdateSingerDto } from '../../dto/update-singer.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { GetSingerInfoDto } from '../../dto/get-singer-info-dto';

@Controller('singer')
@ApiTags('가수 API')
export class SingerController {
  constructor(private readonly singerService: SingerService) {}

  @ApiOperation({
    summary: '가수 리스트 조회 API',
    description: '가수 리스트를 조회한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
    type: [GetSingerInfoDto],
  })
  @Get()
  getAll() {
    return this.singerService.getAll();
  }

  @ApiOperation({
    summary: '가수 정보 조회 API',
    description: '하나의 가수 정보를 조회한다.',
  })
  @ApiParam({ name: 'singerId', description: '조회 가수 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
    type: GetSingerInfoDto,
  })
  @Get(':singerId')
  getOne(@Param('singerId') id: number) {
    return this.singerService.getOne(id);
  }

  @ApiOperation({
    summary: '가수 정보 조회 API',
    description: '하나의 가수 정보를 조회한다.',
  })
  @ApiBody({ type: CreateSingerDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Post()
  create(@Body() singerData: CreateSingerDto) {
    return this.singerService.create(singerData);
  }

  @ApiOperation({
    summary: '가수 정보 수정 API',
    description: '하나의 가수 정보를 수정한다.',
  })
  @ApiParam({ name: 'singerId', description: '수정할 가수 id' })
  @ApiBody({ type: UpdateSingerDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Patch(':singerId')
  patch(@Param('singerId') id: number, @Body() updateData: UpdateSingerDto) {
    return this.singerService.patch(id, updateData);
  }

  @ApiOperation({
    summary: '가수 정보 삭제 API',
    description: '하나의 가수 정보를 삭제한다.',
  })
  @ApiParam({ name: 'singerId', description: '삭제할 가수 id' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
  })
  @Delete(':singerId')
  remove(@Param('singerId') id: number) {
    return this.singerService.remove(id);
  }
}
