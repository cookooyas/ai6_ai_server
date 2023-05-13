import { ApiProperty } from '@nestjs/swagger';

export class GetSingerInfoDto {
  @ApiProperty({ example: 8 })
  id: number;

  @ApiProperty({ example: '뉴진스' })
  name: string;
}
