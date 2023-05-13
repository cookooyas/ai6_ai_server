import { ApiProperty } from '@nestjs/swagger';
import { GetMusicListDto } from './get-music-list-dto';

export class GetMusicInfoDto extends GetMusicListDto {
  @ApiProperty({ example: '이 곡은 어쩌구 저쩌구' })
  description: string;

  @ApiProperty({ example: 100 })
  likes: number;

  @ApiProperty({ example: 500 })
  played: number;

  // @ApiProperty({ example: true })
  // is_like: boolean;
}
