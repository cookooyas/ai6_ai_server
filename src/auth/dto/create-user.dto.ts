import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@test.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'test1' })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ApiProperty({ example: 'testtest' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
