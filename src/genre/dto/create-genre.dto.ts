import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGenreDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;
  // 공백으로 이루어진 문자열 validate는 어떻게 처리? strip??
}
