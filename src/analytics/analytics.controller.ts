import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { FirebaseSecure } from 'src/models/user/decorator/firebase.secure.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('analytics')
@FirebaseSecure()
@ApiBearerAuth()
@ApiTags('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':shopId')
  async getAggregatedAnalyticsReport(@Param('shopId') shopId: number) {
    return this.analyticsService.getAggregatedAnalyticsReport(shopId);
  }

  @Get('deal/:dealId')
  async getDealAnalytics(@Param('dealId') dealId: number) {
    return this.analyticsService.getDealAnalytics(dealId);
  }
}
