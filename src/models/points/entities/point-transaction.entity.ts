import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { User } from 'src/models/user/entities/user.entity';
import { RedeemedDeal } from 'src/models/deals-redeem/entities/deals-redeem.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

export enum PointTransactionType {
  COLLAB_COMPLETION = 'collab_completion', // 100 points per collab
  MONEY_SPENT = 'money_spent', // 5 points per € spent
  VIEWS = 'views', // 0.5 points per view
  LIKES = 'likes', // 1 point per like
  MANUAL_ADJUSTMENT = 'manual_adjustment', // Admin manual adjustment
}

@Entity()
export class PointTransaction extends BaseClassEntity {
  @ManyToOne(() => User, (user) => user.pointTransactions, {
    nullable: false,
    eager: true,
  })
  user: User;

  @Column({ nullable: false })
  @RelationId((transaction: PointTransaction) => transaction.user)
  userId: string;

  @Column({ type: 'enum', enum: PointTransactionType })
  type: PointTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  points: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => RedeemedDeal, { nullable: true })
  redeemedDeal: RedeemedDeal;

  @Column({ nullable: true })
  @RelationId((transaction: PointTransaction) => transaction.redeemedDeal)
  redeemedDealId: number;

  @Column({ nullable: true })
  metadata: string; // JSON string for additional data

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int' })
  year: number;
}