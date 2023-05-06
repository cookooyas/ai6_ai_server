import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenreService } from './genre.service';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  getAll() {
    return this.genreService.getAll();
  }

  @Get(':genreId')
  getOne(@Param('genreId') id: number) {
    return this.genreService.getOne(id);
  }

  @Post()
  create(@Body() genreData: CreateGenreDto) {
    return this.genreService.create(genreData);
  }

  @Patch(':genreId')
  patch(@Param('genreId') id: number, @Body() updateData: UpdateGenreDto) {
    return this.genreService.patch(id, updateData);
  }

  @Delete(':genreId')
  remove(@Param('genreId') id: number) {
    return this.genreService.remove(id);
  }
}
