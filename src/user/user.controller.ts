import {
  Controller,
  Body,
  Param,
  Query,
  ValidationPipe,
  Post,
  Patch,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserInfoDto } from './dto/update-userInfo.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/profile/:userId')
  async findUser(@Param('userId') userId: string) {
    return await this.userService.findUser(+userId);
  }

  @Patch('/profile/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    return await this.userService.updateUser(+userId, updateUserInfoDto);
  }

  @Patch('/password/:userId')
  async updatePassword(
    @Param('userId') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(+userId, updatePasswordDto);
  }

  @Get('/calendar/:userId')
  async findCalendar(
    @Param('userId') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return await this.userService.findCalendar(+userId, year, month);
  }

  @Get('/likes/:userId')
  async findLikes(
    @Param('userId') userId: string,
    @Query('pageno') pageno: string,
  ) {
    return await this.userService.findLikes(+userId, +pageno);
  }
}
