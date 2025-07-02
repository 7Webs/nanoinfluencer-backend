import {
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import { Pagination } from 'src/common/dtos/pagination.dto';

@ApiTags('Points')
@Controller('points')
@FirebaseSecure()
@ApiBearerAuth()
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('my-transactions')
  @ApiOperation({ summary: 'Get my point transaction history' })
  getMyTransactionHistory(@FUser() user: FirebaseUser) {
    return this.pointsService.getUserPointTransactionHistory(user.uid);
  }

  @Get('transactions/:uid')
  @ApiOperation({ summary: 'Get a point transaction by ID' })
  getTransactionById(@Param('uid') uid: string, @Query() pagination: Pagination) {
    return this.pointsService.getTransactionById(uid, pagination);
  }

  @Get('my-points')
  @ApiOperation({ summary: 'Get my current month points' })
  getMyCurrentMonthPoints(@FUser() user: FirebaseUser) {
    return this.pointsService.getUserCurrentMonthPoints(user.uid);
  }

  @Get('my-monthly-points')
  @ApiOperation({ summary: 'Get my points for a specific month' })
  @ApiQuery({ name: 'month', required: false, description: 'Month (1-12), defaults to current month' })
  @ApiQuery({ name: 'year', required: false, description: 'Year, defaults to current year' })
  getMyMonthlyPoints(
    @FUser() user: FirebaseUser,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();
    
    return this.pointsService.getUserMonthlyPoints(user.uid, targetMonth, targetYear);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get current month leaderboard' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users to return (default: 50)' })
  getCurrentMonthLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.pointsService.getCurrentMonthLeaderboard(limitNum);
  }

  @Get('leaderboard/monthly')
  @ApiOperation({ summary: 'Get leaderboard for a specific month' })
  @ApiQuery({ name: 'month', required: false, description: 'Month (1-12), defaults to current month' })
  @ApiQuery({ name: 'year', required: false, description: 'Year, defaults to current year' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users to return (default: 50)' })
  getMonthlyLeaderboard(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('limit') limit?: string,
  ) {
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const limitNum = limit ? parseInt(limit) : 50;
    
    return this.pointsService.getMonthlyLeaderboard(targetMonth, targetYear, limitNum);
  }

  @Post('reset-leaderboard')
  @ApiOperation({ summary: 'Reset current month leaderboard (Admin only)' })
  async resetLeaderBoard(@FUser() user: FirebaseUser) {
    await this.pointsService.resetLeaderBoard(user.uid);
  }
}