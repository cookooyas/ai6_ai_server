import {
  Controller,
  Req,
  Body,
  Query,
  Get,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserInfoDto } from './dto/update-userInfo.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
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
    summary: 'userinfo 수정 API',
    description:
      '유저토큰을 통해 인증하고 바디 정보로 회원 닉네임/비밀번호를 수정한다.',
  })
  @ApiBody({ type: UpdateUserInfoDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (request success를 반환한다)',
    type: 'requeset success',
  })
  @Patch('/profile')
  async updateUserInfo(
    @Req() req,
    @Body() updateUserInfoDto: UpdateUserInfoDto,
  ) {
    const { user_id } = req.user;
    return await this.userService.updateUserInfo(+user_id, updateUserInfoDto);
  }

  @ApiOperation({
    summary: 'user profile image 업로드 및 변경 API',
    description:
      '유저토큰을 통해 인증하고 바디의 file을 받아 프로필 이미지를 업로드하고 url정보를 수정한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (수정된 유저 프로필 이미지 url을 반환한다)',
    type: 'https://ai11dancerflow-upload-user-profile-image.s3.ap-northeast-2.amazonaws.com/%EB%9D%BC%EC%9D%B4%EC%96%B8_1684091515649.png',
  })
  // 이미지 url이 바뀌면 이전에 저장된 이미지는 날려버리자!
  @Post('/profile/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserProfileImage(
    @Req() req,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    const { user_id } = req.user;
    return this.userService.uploadUserProfileImage(user_id, file);
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
  @ApiQuery({
    name: 'pageno',
    description:
      '페이지번호, 페이지 번호를 명시하지 않을 경우 전체 찜 리스트를, 초과된 페이지 번호를 호출할 경우 가장 마지막 페이지를 반환한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (유저 찜 리스트를 반환한다.)',
  })
  @Get('/likes')
  async findLikes(@Req() req, @Query('pageno') pageno: string) {
    const { user_id } = req.user;
    return await this.userService.findLikes(+user_id, pageno ? +pageno : 0);
  }

  @ApiOperation({
    summary: 'user history 조회 API',
    description: '유저토큰을 통해 인증된 유저의 히스토리를 조회한다.',
  })
  @ApiQuery({
    name: 'pageno',
    required: true,
    description:
      '페이지번호, 페이지 번호를 명시해야하며, 초과된 페이지 번호를 호출할 경우 가장 마지막 페이지를 반환한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (유저 히스토리 리스트를 반환한다.)',
  })
  @Get('/game/history')
  async findAllGameHistory(@Req() req, @Query('pageno') pageno: string) {
    const { user_id } = req.user;
    return await this.userService.findAllGameHistory(+user_id, +pageno);
  }

  @ApiOperation({
    summary: 'user 상세 스코어 조회 API',
    description:
      '유저토큰을 통해 인증하고 노래 아이디를 파라미터로 받아 해당 노래의 디테일한 정보를 조회한다.',
  })
  @ApiParam({ name: 'musicId', description: '노래 id.' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (유저 노래 상세 점수 리스트를 반환한다.)',
  })
  @Get('/game/history/:musicId')
  async findOneGameHistory(@Req() req, @Param('musicId') musicId: string) {
    const { user_id } = req.user;
    return await this.userService.findOneGameHistory(+user_id, +musicId);
  }

  @Get('/item/all')
  getAllItem() {
    return this.userService.getAllItem();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/item')
  getClothedItem(@Req() req) {
    const { user_id } = req.user;
    return this.userService.getClothedItem(user_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/item/:itemId')
  changeItem(@Param('itemId') itemId: number, @Req() req) {
    const { user_id } = req.user;
    return this.userService.changeItem(itemId, user_id);
  }
}
