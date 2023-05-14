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
import { UpdateUserProfile } from 'src/util/swaggerOkResponse/updateUserProfile';
import { GetUserCalendar } from 'src/util/swaggerOkResponse/getUserCalendar';

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

  @ApiOperation({
    summary: 'user profile 수정 API',
    description: '유저토큰을 통해 인증하고 바디 정보로 회원정보를 수정한다.',
  })
  @ApiBody({ type: UpdateUserInfoDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (수정된 메세지를 반환한다)',
    type: UpdateUserProfile,
  })
  @Patch('/profile')
  async updateUser(@Req() req, @Body() updateUserInfoDto: UpdateUserInfoDto) {
    const { user_id } = req.user;
    return await this.userService.updateUser(+user_id, updateUserInfoDto);
  }

  @ApiOperation({
    summary: 'user profile 수정 API',
    description: '유저토큰을 통해 인증하고 바디 정보로 회원정보를 수정한다.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (request success메세지를 반환한다.)',
    type: 'request success',
  })
  @Patch('/password')
  async updatePassword(
    @Req() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const { user_id } = req.user;
    await this.userService.updatePassword(+user_id, updatePasswordDto);
    return 'request success';
  }

  @ApiOperation({
    summary: 'user calender 조회 API',
    description: '유저토큰을 통해 유저의 일일 플레이 기록을 조회한다.',
  })
  @ApiQuery({ name: 'year', required: true, description: '조회 년도 (4자리)' })
  @ApiQuery({ name: 'month', required: true, description: '조회 월 (1~2자리)' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (매일 플레이 기록을 반환한다.)',
  })
  @Get('/calendar')
  async findCalendar(
    @Req() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const { user_id } = req.user;
    return await this.userService.findCalendar(+user_id, year, month);
  }

  @ApiOperation({
    summary: 'user likes 조회 API',
    description: '유저토큰을 통해 인증하고 likes 목록을 조회한다.',
  })
  @Get('/likes')
  async findLikes(@Req() req, @Query('pageno') pageno: string) {
    const { user_id } = req.user;
    return await this.userService.findLikes(+user_id, pageno ? +pageno : 0);
  }

  @ApiOperation({
    summary: 'user profile 수정 API',
    description: '유저토큰을 통해 인증하고 바디 정보로 회원정보를 수정한다.',
  })
  @Get('/game/history')
  async findAllGameHistory(@Req() req, @Query('pageno') pageno: string) {
    const { user_id } = req.user;
    return await this.userService.findAllGameHistory(
      +user_id,
      pageno ? +pageno : 0,
    );
  }

  @ApiOperation({
    summary: 'user profile 수정 API',
    description: '유저토큰을 통해 인증하고 바디 정보로 회원정보를 수정한다.',
  })
  @Get('/game/history/:musicId')
  async findOneGameHistory(@Req() req, @Param('musicId') musicId: string) {
    const { user_id } = req.user;
    return await this.userService.findOneGameHistory(+user_id, +musicId);
  }
}
