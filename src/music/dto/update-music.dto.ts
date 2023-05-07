import { CreateMusicDto } from './create-music.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateMusicDto extends PartialType(CreateMusicDto) {}
