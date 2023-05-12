import {
  Controller,
  Req,
  Res,
  Body,
  Param,
  ValidationPipe,
  UseGuards,
  Post,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { user } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentialDto } from './dto/authCredential.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetJoinInfo } from 'src/util/swaggerOkResponse/getJoinInfo';
import { GetSigninAccessToken } from 'src/util/swaggerOkResponse/getSigninAccessToken';
import { GetSignoutMessage } from 'src/util/swaggerOkResponse/getSignoutMessage';
import { GetLeaveMessage } from 'src/util/swaggerOkResponse/getLeaveMessage';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 회원가입 API
  @ApiOperation({
    summary: '회원가입 API',
    description: 'email, nickname, password를 입력받아 회원가입을 요청한다.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (user id와 created_at deleted_at을 반환한다)',
    type: GetJoinInfo,
  })
  @Post('/join')
  async join(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<user> {
    return await this.authService.createUser(createUserDto);
  }

  // 중복체크 API
  @ApiOperation({
    summary: '중복체크 API',
    description: 'email 또는 nickname을 입력받아 중복검사를 요청한다.',
  })
  @ApiParam({ name: 'type', description: 'email 또는 nickname만을 받는다.' })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (해당 값이 중복되었을 경우, true를 반환한다.)',
  })
  @Post('/join/duplicate/:type')
  async checkDuplication(
    @Param('type') type: 'email' | 'nickname',
    @Body() value,
  ): Promise<boolean> {
    return await this.authService.checkDuplication(type, value);
  }

  // 로그인 API
  @ApiOperation({
    summary: '로그인 API',
    description: 'email과 password를 입력받아 중복검사를 요청한다.',
  })
  @ApiBody({ type: AuthCredentialDto })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (user id와 created_at deleted_at을 반환한다)',
    type: GetSigninAccessToken,
  })
  @Post('/signin')
  async signin(
    @Res({ passthrough: true }) res,
    @Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
  ) {
    const { accessToken } = await this.authService.signin(authCredentialDto);
    res.cookie('AccessToken', accessToken);
    return 'login success';
  }

  // 로그아웃 API

  @ApiOperation({
    summary: '로그아웃 API',
    description: '로그아웃을 요청하여 user_token의 refresh token을 제거한다.',
  })
  @ApiParam({
    name: 'userId',
    description:
      '토큰과 인증관련 미들웨어를 설정하기전 임의로 세워둔 파라미터, 유저아이디를 입력한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (signout success메세지를 반환한다.)',
    type: GetSignoutMessage,
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/signout')
  async signout(@Req() req): Promise<{ message: string }> {
    const { user_id } = req.user;
    return await this.authService.signout(+user_id);
  }

  // 회원탈퇴 API
  @ApiOperation({
    summary: '회원탈퇴 API',
    description: '회원탈퇴를 요청하여 user의 smooth_delete를 진행한다.',
  })
  @ApiParam({
    name: 'userId',
    description:
      '토큰과 인증관련 미들웨어를 설정하기전 임의로 세워둔 파라미터, 유저아이디를 입력한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (leave success메세지를 반환한다.)',
    type: GetLeaveMessage,
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/leave')
  async leave(@Req() req): Promise<{ message: string }> {
    const { user_id } = req.user;
    return await this.authService.leave(+user_id);
  }

  // 비밀번호 검증 API
  @ApiOperation({
    summary: '비밀번호 검증 API',
    description:
      'userId를 파라미터로, password를 바디로 입력받아 비밀번호를 검증한다.',
  })
  @ApiParam({
    name: 'userId',
    description:
      '토큰과 인증관련 미들웨어를 설정하기전 임의로 세워둔 파라미터, 유저아이디를 입력한다.',
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답 (검증이 확인되었을 경우, true를 반환한다.)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('/password')
  async checkPassword(@Req() req, @Body() data: any): Promise<boolean> {
    const { user_id } = req.user;
    return await this.authService.checkPassword(+user_id, data);
  }
}
