import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedeemedDeal } from 'src/models/deals-redeem/entities/deals-redeem.entity';
import { Deal } from 'src/models/deals/entities/deal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(RedeemedDeal)
    private readonly redeemedDealRepository: Repository<RedeemedDeal>,
  ) {}

  async getAggregatedAnalyticsReport(shopId: number) {
    // Total number of deals for the shop
    const totalDeals = await this.dealRepository.count({
      where: { shop: { id: shopId } },
    });

    // Total number of redeemed deals for the shop
    const totalRedeemedDeals = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .innerJoin('redeemedDeal.deal', 'deal')
      .where('deal.shopId = :shopId', { shopId })
      .withDeleted()
      .getCount();

    // Deals nearing expiration for the shop (within the next 7 days)
    const dealsNearingExpiration = await this.dealRepository
      .createQueryBuilder('deal')
      .where('deal.shopId = :shopId', { shopId })
      .andWhere('deal.availableUntil BETWEEN :now AND :nextWeek', {
        now: new Date(),
        nextWeek: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      })
      .getMany();

    // Redemption rate for each deal of the shop
    const redemptionRate = await this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.redeemedDeals', 'redeemedDeal')
      .select([
        'deal.id',
        'deal.title',
        'deal.images',
        'COUNT(redeemedDeal.id) AS redeemedCount',
      ])
      .where('deal.shopId = :shopId', { shopId })
      .groupBy('deal.id')
      .limit(10)
      .getRawMany();

    // Approval statistics for redeemed deals of the shop
    const approvalStats = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .innerJoin('redeemedDeal.deal', 'deal')
      .select(['redeemedDeal.status', 'COUNT(redeemedDeal.id) AS count'])
      .where('deal.shopId = :shopId', { shopId })
      .groupBy('redeemedDeal.status')
      .getRawMany();

    // User engagement: Top 5 users by redeemed deals for the shop
    const topUsers = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .innerJoin('redeemedDeal.deal', 'deal')
      .leftJoinAndSelect('redeemedDeal.user', 'user')
      .select([
        'user.id',
        'user.name',
        'COUNT(redeemedDeal.id) AS redeemedCount',
      ])
      .where('deal.shopId = :shopId', { shopId })
      .groupBy('user.id')
      .orderBy('redeemedCount', 'DESC')
      .limit(5)
      .getRawMany();

    // Time-series data for approvals, redemptions, and usages per day
    const timeSeriesData = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .innerJoin('redeemedDeal.deal', 'deal')
      .select([
        'DATE(redeemedDeal.createdAt) AS date',
        "SUM(CASE WHEN redeemedDeal.status = 'approved' THEN 1 ELSE 0 END) AS approvals",
        'SUM(CASE WHEN redeemedDeal.used = true THEN 1 ELSE 0 END) AS usages',
        'COUNT(redeemedDeal.id) AS redemptions',
      ])
      .where('deal.shopId = :shopId', { shopId })
      .groupBy('DATE(redeemedDeal.createdAt)')
      .orderBy('DATE(redeemedDeal.createdAt)', 'ASC')
      .getRawMany();

    // Compile the analytics report for the shop
    return {
      shopId,
      totalDeals,
      totalRedeemedDeals,
      dealsNearingExpiration,
      redemptionRate,
      approvalStats,
      topUsers,
      timeSeriesData, // Added time-series data
    };
  }

  async getDealAnalytics(dealId: number) {
    // Ensure the deal exists
    const deal = await this.dealRepository.findOne({ where: { id: dealId }, withDeleted: true });
    if (!deal) {
      throw new Error('Deal not found');
    }

    // Total redemptions for the deal
    const totalRedemptions = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .where('redeemedDeal.dealId = :dealId', { dealId })
      .withDeleted()
      .getCount();

    // Redemption status statistics for the deal
    const redemptionStatuses = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .select(['redeemedDeal.status', 'COUNT(redeemedDeal.id) AS count'])
      .where('redeemedDeal.dealId = :dealId', { dealId })
      .groupBy('redeemedDeal.status')
      .withDeleted()
      .getRawMany();

    // Top users who redeemed this deal
    const topUsers = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .leftJoinAndSelect('redeemedDeal.user', 'user')
      .select([
        'user.id',
        'user.name',
        'COUNT(redeemedDeal.id) AS redeemedCount',
      ])
      .where('redeemedDeal.dealId = :dealId', { dealId })
      .groupBy('user.id')
      .orderBy('redeemedCount', 'DESC')
      .withDeleted()
      .limit(5)
      .getRawMany();

    // Total number of approvals for the deal
    const totalApprovals = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .where('redeemedDeal.dealId = :dealId', { dealId })
      .andWhere('redeemedDeal.status = :status', { status: 'approved' })
      .withDeleted()
      .getCount();

    // Daily approvals, redemptions, and usages
    const dailyMetrics = await this.redeemedDealRepository
      .createQueryBuilder('redeemedDeal')
      .select([
        'DATE(redeemedDeal.createdAt) AS date',
        "SUM(CASE WHEN redeemedDeal.status = 'approved' THEN 1 ELSE 0 END) AS approvals",
        'SUM(CASE WHEN redeemedDeal.used = true THEN 1 ELSE 0 END) AS usages',
        'COUNT(redeemedDeal.id) AS redemptions',
      ])
      .where('redeemedDeal.dealId = :dealId', { dealId })
      .groupBy('DATE(redeemedDeal.createdAt)')
      .orderBy('DATE(redeemedDeal.createdAt)', 'ASC')
      .withDeleted()
      .getRawMany();

    // Compile analytics for the deal
    return {
      dealId,
      dealTitle: deal.title,
      totalRedemptions,
      redemptionStatuses,
      topUsers,
      totalApprovals,
      dailyMetrics,
      //   averageApprovalTime: approvalTime?.avgApprovalTime || 0,
    };
  }
}
