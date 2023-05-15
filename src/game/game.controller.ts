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

  // 게임 플레이시 played +1 해주는 로직은 game에 작성하면 되나?
}
