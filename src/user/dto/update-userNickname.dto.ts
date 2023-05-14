import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserNicknameDto {
  @IsNotEmpty()
  @IsString()
  nickname: string;
}
