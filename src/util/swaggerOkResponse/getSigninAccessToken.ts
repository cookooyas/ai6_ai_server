import { ApiProperty } from '@nestjs/swagger';

export class GetSigninAccessToken {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlc3QuY29tIiwiaWF0IjoxNjgzNjk5MDY0LCJleHAiOjE2ODM3MDI2NjR9.OWabFkZ1pPaJg5zf0cKM9RqXYupZOyBF9WWXTFJ1tVA',
  })
  accessToken: string;
}
