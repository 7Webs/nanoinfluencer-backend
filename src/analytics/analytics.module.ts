import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedeemedDeal } from 'src/models/deals-redeem/entities/deals-redeem.entity';
import { Deal } from 'src/models/deals/entities/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RedeemedDeal, Deal])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
