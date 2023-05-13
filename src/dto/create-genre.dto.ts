import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGenreDto {
  @ApiProperty({ example: '어반댄스' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
  // 공백으로 이루어진 문자열 validate는 어떻게 처리? strip??
}
