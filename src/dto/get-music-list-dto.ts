import { ApiProperty } from '@nestjs/swagger';
import { GetGenreInfoDto } from './get-genre-info.dto';
import { GetSingerInfoDto } from './get-singer-info-dto';

export class GetMusicListDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '하입보이' })
  name: string;

  @ApiProperty()
  music_genre: GetGenreInfoDto;

  @ApiProperty()
  music_singer: GetSingerInfoDto;

  @ApiProperty({ example: 'https://www.~~~' })
  album_image_url: string;
}
