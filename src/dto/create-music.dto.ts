import {
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMusicDto {
  @ApiProperty({ example: '하입보이' })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  readonly genre_id?: number;
  // 필수 아님, music_genre 테이블에 해당 장르 이름이 있는지 조회 후 없으면 추가해서 id 저장

  @ApiProperty({ example: '이 노래는 어쩌구저쩌구' })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  readonly singer_id: number;

  @ApiProperty({ example: 'https://' })
  @IsNotEmpty()
  @IsString()
  readonly album_image_url: string;

  @ApiProperty({ example: 'https://' })
  @IsNotEmpty()
  @IsString()
  readonly video_url: string;

  @ApiProperty({ example: 102 })
  @IsNotEmpty()
  @IsNumber()
  readonly total_count: number;

  @ApiProperty({ example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  readonly total_score: number;

  @ApiProperty({ example: {} })
  @IsNotEmpty()
  @IsJSON()
  readonly sheet: object; // object 아님, 잘못됨
}
