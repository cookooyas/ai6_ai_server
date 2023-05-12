import {
  Controller,
  Req,
  Res,
  Body,
  Query,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserInfoDto } from './dto/update-userInfo.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/profile')
  async findUser(@Req() req) {
    const { user_id } = req.user;
    return await this.userService.findUser(+user_id);
  }

  @Patch('/profile')
  async updateUser(@Req() req, @Body() updateUserInfoDto: UpdateUserInfoDto) {
    const { user_id } = req.user;
    return await this.userService.updateUser(+user_id, updateUserInfoDto);
  }

  @Patch('/password')
  async updatePassword(
    @Req() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const { user_id } = req.user;
    return await this.userService.updatePassword(+user_id, updatePasswordDto);
  }

  @Get('/calendar')
  async findCalendar(
    @Req() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const { user_id } = req.user;
    return await this.userService.findCalendar(+user_id, year, month);
  }

  @Get('/likes')
  async findLikes(@Req() req, @Query('pageno') pageno: string) {
    const { user_id } = req.user;
    return await this.userService.findLikes(+user_id, +pageno);
  }
}
