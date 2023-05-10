import { ApiProperty } from '@nestjs/swagger';

export class GetSignoutMessage {
  @ApiProperty({
    example: 'signout success',
  })
  message: string;
}
