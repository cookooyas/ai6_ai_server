import { ApiProperty } from '@nestjs/swagger';
import { GetSingerInfo } from './getSingerInfo';
import { GetGenreInfo } from './getGenreInfo';

export class GetMusicList {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '하입보이' })
  name: string;

  @ApiProperty()
  music_genre: GetGenreInfo;

  @ApiProperty()
  music_singer: GetSingerInfo;

  @ApiProperty({ example: 'https://www.~~~' })
  album_image_url: string;
}
