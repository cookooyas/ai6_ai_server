import { ApiProperty } from '@nestjs/swagger';

export class GetUserCalendar {
  @ApiProperty({
    example: [
      {
        created_at: '2023-05-11T13:36:27.000Z',
      },
      {
        created_at: '2023-05-13T13:36:27.000Z',
      },
      {
        created_at: '2023-05-15T13:36:27.000Z',
      },
    ],
  })
  calendar: object[];
}
