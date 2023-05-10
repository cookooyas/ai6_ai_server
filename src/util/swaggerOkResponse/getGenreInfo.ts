import { ApiProperty } from '@nestjs/swagger';

export class GetGenreInfo {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '모던락' })
  name: string;
}
