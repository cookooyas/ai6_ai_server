import { IsString, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  profile_image_url: string;

  @IsOptional()
  @IsString()
  nickname: string;
}
