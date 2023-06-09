import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialDto {
  @ApiProperty({ example: 'test1@test.com' })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'testtest' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
