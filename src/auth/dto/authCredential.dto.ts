import { IsNotEmpty, IsString } from 'class-validator';

export class AuthCredentialDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
