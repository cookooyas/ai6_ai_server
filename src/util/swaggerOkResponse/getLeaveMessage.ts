import { ApiProperty } from '@nestjs/swagger';

export class GetLeaveMessage {
  @ApiProperty({
    example: 'leave success',
  })
  message: string;
}
