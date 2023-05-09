import {
  Controller,
  Body,
  Param,
  ValidationPipe,
  Post,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { user } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentialDto } from './dto/authCredential.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/join')
  async join(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<user> {
    return await this.authService.createUser(createUserDto);
  }

  @Post('/join/duplicate/:type')
  async checkDuplication(
    @Param('type') type: 'email' | 'nickname',
    @Body() value,
  ): Promise<boolean> {
    return await this.authService.checkDuplication(type, value);
  }

  @Post('/signin')
  async signin(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken }> {
    return await this.authService.signin(authCredentialDto);
  }

  @Delete('/signout/:userId')
  async signout(@Param('userId') userId: string): Promise<{ message: string }> {
    return await this.authService.signout(+userId);
  }

  @Delete('/leave/:userId')
  async leave(@Param('userId') userId: string): Promise<{ message: string }> {
    return await this.authService.leave(+userId);
  }

  @Post('/password/:userId')
  async checkPassword(
    @Param('userId') userId: string,
    @Body() data: any,
  ): Promise<boolean> {
    console.log(typeof data);
    return await this.authService.checkPassword(+userId, data);
  }
}
