import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSingerDto {
  @ApiProperty({ example: '뉴진스' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;
  // 공백으로 이루어진 문자열 validate는 어떻게 처리? strip??
}
