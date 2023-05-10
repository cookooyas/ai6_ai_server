import { ApiProperty } from '@nestjs/swagger';

export class GetJoinInfo {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2023-05-10T07:02:56.000Z' })
  created_at: Date;

  @ApiProperty({ example: null })
  deleted_at: Date;
}
