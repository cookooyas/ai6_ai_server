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
import { CreateSingerDto } from './dto/create-singer.dto';
import { UpdateSingerDto } from './dto/update-singer.dto';

@Controller('singer')
export class SingerController {
  constructor(private readonly singerService: SingerService) {}

  @Get()
  getAll() {
    return this.singerService.getAll();
  }

  @Get(':singerId')
  getOne(@Param('singerId') id: number) {
    return this.singerService.getOne(id);
  }

  @Post()
  create(@Body() singerData: CreateSingerDto) {
    return this.singerService.create(singerData);
  }

  @Patch(':singerId')
  patch(@Param('singerId') id: number, @Body() updateData: UpdateSingerDto) {
    return this.singerService.patch(id, updateData);
  }

  @Delete(':singerId')
  remove(@Param('singerId') id: number) {
    return this.singerService.remove(id);
  }
}
