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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { GetUserProfile } from 'src/util/swaggerOkResponse/getUserProfile';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
@ApiTags('유저 API')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary: 'user profile 조회 API',
    description: '유저토큰을 통해 회원정보를 조회한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (유저 정보를 반환한다)',
    type: GetUserProfile,
  })
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

  @Get('/game/history')
  async findAllGameHistory(@Req() req, @Query('pageno') pageno: string) {
    const { user_id } = req.user;
    return await this.userService.findAllGameHistory(+user_id, +pageno);
  }

  @Get('/game/history/:musicId')
  async findOneGameHistory(@Req() req, @Param('musicId') musicId: string) {
    const { user_id } = req.user;
    return await this.userService.findOneGameHistory(+user_id, +musicId);
  }
}
