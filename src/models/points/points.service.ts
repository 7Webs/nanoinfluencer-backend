import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { PointTransaction, PointTransactionType } from './entities/point-transaction.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { RedeemedDeal } from '../deals-redeem/entities/deals-redeem.entity';
import { Pagination } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async creditPoints(
    userId: string,
    type: PointTransactionType,
    points: number,
    description?: string,
    redeemedDealId?: number,
    metadata?: any,
  ): Promise<PointTransaction> {
    const now = new Date();
    const transaction = this.pointTransactionRepository.create({
      userId,
      type,
      points,
      description,
      redeemedDealId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      transactionDate: now,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    const savedTransaction = await this.pointTransactionRepository.save(transaction);
    
    // Update user's current month points
    await this.updateUserCurrentMonthPoints(userId);
    
    return savedTransaction;
  }

  async creditCollabPoints(redeemedDeal: RedeemedDeal): Promise<PointTransaction[]> {
    const transactions: PointTransaction[] = [];
    const userId = redeemedDeal.userId;
    
    // 100 points for collab completion
    const collabTransaction = await this.creditPoints(
      userId,
      PointTransactionType.COLLAB_COMPLETION,
      100,
      `Collab completion for deal: ${redeemedDeal.deal?.title || 'Unknown'}`,
      redeemedDeal.id,
    );
    transactions.push(collabTransaction);

    // 5 points per € spent (if amount spent is provided)
    if (redeemedDeal.amountSpent && redeemedDeal.amountSpent > 0) {
      const spentPoints = redeemedDeal.amountSpent * 5;
      const spentTransaction = await this.creditPoints(
        userId,
        PointTransactionType.MONEY_SPENT,
        spentPoints,
        `Money spent: €${redeemedDeal.amountSpent}`,
        redeemedDeal.id,
        { amountSpent: redeemedDeal.amountSpent },
      );
      transactions.push(spentTransaction);
    }

    // 0.5 points per view
    if (redeemedDeal.totalViews && redeemedDeal.totalViews > 0) {
      const viewPoints = redeemedDeal.totalViews * 0.5;
      const viewTransaction = await this.creditPoints(
        userId,
        PointTransactionType.VIEWS,
        viewPoints,
        `Views: ${redeemedDeal.totalViews}`,
        redeemedDeal.id,
        { views: redeemedDeal.totalViews },
      );
      transactions.push(viewTransaction);
    }

    // 1 point per like
    if (redeemedDeal.totalLikes && redeemedDeal.totalLikes > 0) {
      const likePoints = redeemedDeal.totalLikes * 1;
      const likeTransaction = await this.creditPoints(
        userId,
        PointTransactionType.LIKES,
        likePoints,
        `Likes: ${redeemedDeal.totalLikes}`,
        redeemedDeal.id,
        { likes: redeemedDeal.totalLikes },
      );
      transactions.push(likeTransaction);
    }

    return transactions;
  }

  async getUserPointTransactionHistory(userId: string): Promise<PointTransaction[]> {
    return await this.pointTransactionRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
      relations: ['redeemedDeal', 'redeemedDeal.deal'],
    });
  }

  async getUserCurrentMonthPoints(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['currentMonthPoints'],
    });
    
    return user?.currentMonthPoints || 0;
  }

  async getUserMonthlyPoints(userId: string, month: number, year: number): Promise<number> {
    const result = await this.pointTransactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.points)', 'totalPoints')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.month = :month', { month })
      .andWhere('transaction.year = :year', { year })
      .getRawOne();

    return parseFloat(result.totalPoints) || 0;
  }

  private async updateUserCurrentMonthPoints(userId: string): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const totalPoints = await this.getUserMonthlyPoints(userId, currentMonth, currentYear);
    
    await this.userRepository.update(
      { id: userId },
      { currentMonthPoints: totalPoints },
    );
  }

  async getMonthlyLeaderboard(month: number, year: number, limit: number = 50) {
    return await User.find(
      {
        where: {
          currentMonthPoints: MoreThan(0),
        },
        order: {
          currentMonthPoints: 'DESC',
        },
        take: limit,
      },
    )
  }

  async getCurrentMonthLeaderboard(limit: number = 50) {
    return await User.find(
      {
        where: {
          currentMonthPoints: MoreThan(0),
        },
        order: {
          currentMonthPoints: 'DESC',
        },
        take: limit,
      },
    )
  }

  async resetLeaderBoard(uid: string) {
    const user = await User.findOne({
      where: {
        id: uid,
      },
    })

    if(user.role !== UserRole.admin) {
      throw new ForbiddenException('Only admin can reset leaderboard');
    }
    await this.userRepository.update(
      {
        currentMonthPoints: MoreThan(0),
      },
      { currentMonthPoints: 0 },
    );
  }

  async getTransactionById(uid: string, pagination: Pagination): Promise<PointTransaction[]> {
    return await this.pointTransactionRepository.find({
      where: {
        userId: uid,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: pagination.skip,
      take: pagination.take,
    })
  }
}