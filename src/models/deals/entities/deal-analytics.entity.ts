import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Deal } from './deal.entity';
import { User } from 'src/models/user/entities/user.entity';

export enum DealAnalyticsType {
  VIEW = 'view',
  OPEN = 'open',
  SHARE = 'share',
  MONEY_SPENT = 'money_spent',
}

@Entity()
export class DealAnalytics extends BaseClassEntity {
  @ManyToOne(() => Deal, { nullable: false })
  deal: Deal;

  @Column()
  @RelationId((analytics: DealAnalytics) => analytics.deal)
  dealId: number;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  @RelationId((analytics: DealAnalytics) => analytics.user)
  userId: string;

  @Column({
    type: 'enum',
    enum: DealAnalyticsType,
  })
  type: DealAnalyticsType;

  @Column({ type: 'float', nullable: true })
  amount?: number; // For money spent tracking

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // For additional tracking data
}
