import { ApiProperty } from '@nestjs/swagger';

export class GetGameRankListDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '모모모' })
  nickname: string;

  @ApiProperty({ example: 'https://www.~~~' })
  profile_image_url: number;

  @ApiProperty({ example: '10' })
  xp: number;

  @ApiProperty({ example: 100 })
  score: number;

  @ApiProperty({ example: 3 })
  rank: number;
}
