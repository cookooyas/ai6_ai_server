import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PAGINATION } from '../util/constants';
import { GetGameRankListDto } from '../dto/get-game-rank-list.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('game')
@ApiTags('게임 API')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({
    summary: '뮤직별 랭킹 조회',
    description: '뮤직별 스코어 랭킹을 조회한다.',
  })
  @ApiParam({ name: 'musicId', description: '조회할 뮤직 id' })
  @ApiQuery({
    name: 'top',
    description: '랭킹을 몇 개 보여줄 지 결정한다. 없으면 기본값 5',
    required: false,
  })
  @ApiOkResponse({
    status: 200,
    description: '정상 응답',
    type: [GetGameRankListDto],
  })
  @Get('ranking/:musicId')
  rankingByMusic(@Param('musicId') id: number, @Query('top') top?: number) {
    return this.gameService.rankingByMusic(
      id,
      top ? Math.floor(top) : PAGINATION.DEFAULT_TOP,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('ranking/my/:musicId')
  myBestScoreByMusic(@Param('musicId') id: number, @Req() req) {
    const { user_id } = req.user;
    return this.gameService.myBestScoreByMusic(id, user_id);
  }

  @Get('answer/:musicId')
  getAnswer(@Param('musicId') id: number) {
    return this.gameService.getAnswer(id);
  }

  // @Get('abcdefg')
  // test2() {
  //   console.log('guest');
  //   return;
  // }

  // guest랑 user인 거 어떻게 구분해서 게임 결과 저장할 수 있는지..?
  // 같은 엔드포인트 사용하면 안 되나요? req부분을 뒤에 두면 인식을 못 하고, 앞에 두면 없는 걸 인식 못 합니다 -> 어떻게 고쳐야 할까요?
  // 일단 다른 엔드포인트, api로 구현해 보겠음.
  // @UseGuards(AuthGuard('jwt'))
  // @Get('abcdefg')
  // test2(@Req() req) {
  //   console.log('user');
  //   console.log(req.user);
  //   return req.user;
  // }
  //
  // @Get('abcdefg')
  // test() {
  //   console.log('guest');
  //   return 'guest';
  // }

  // musicId 버전
  @UseGuards(AuthGuard('jwt'))
  @Get('result/:musicId')
  getScore(@Param('musicId') id: number, @Req() req) {
    const { user_id } = req.user;
    return this.gameService.getScore(id, user_id);
  }
  // // scoreId 버전
  // @Get('result/:scoreId')
  // getScore(@Param('scoreId') id: number) {
  //   return this.gameService.getScore(id);
  // }

  // 게임 플레이시 played +1 해주는 로직은 game에 작성하면 되나?
}
