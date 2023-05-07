import {
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMusicDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsNumber()
  readonly genre_id?: number;
  // 필수 아님, music_genre 테이블에 해당 장르 이름이 있는지 조회 후 없으면 추가해서 id 저장

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNotEmpty()
  @IsString()
  readonly singer_id: number;

  @IsNotEmpty()
  @IsString()
  readonly album_image_url: string;

  @IsNotEmpty()
  @IsString()
  readonly video_url: string;

  @IsNotEmpty()
  @IsNumber()
  readonly total_count: number;

  @IsNotEmpty()
  @IsNumber()
  readonly total_score: number;

  @IsNotEmpty()
  @IsJSON()
  readonly sheet: object; // 수정 필요 + json으로 못 받나?
}
