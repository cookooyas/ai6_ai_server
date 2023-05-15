import { IsString, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  current_password: string;

  @IsOptional()
  @IsString()
  new_password: string;
}
