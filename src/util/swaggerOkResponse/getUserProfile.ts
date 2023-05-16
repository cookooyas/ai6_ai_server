import { ApiProperty } from '@nestjs/swagger';

export class GetUserProfile {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'test2' })
  nickname: string;

  @ApiProperty({ example: 'test2@test.com' })
  email: string;

  @ApiProperty({
    example:
      'https://www.google.com/url?sa=i&url=https%3A%2F%2Fgithub.com%2Fscottsweb%2Fnull&psig=AOvVaw3BsOhYVRqYg2iiMss_NVsU&ust=1683609303786000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCPCGp9n75P4CFQAAAAAdAAAAABAJ',
  })
  profile_image_url: string;

  @ApiProperty({ example: 1 })
  current_tier: number;
}