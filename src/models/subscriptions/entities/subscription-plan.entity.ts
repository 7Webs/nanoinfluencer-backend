import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { Shop } from 'src/models/shop/entities/shop.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum SubscriptionInterval {
    MONTH = 'month',
    YEAR = 'year',
}

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseClassEntity {
  @Column()
  stripePriceId: string; // The ID of the subscription plan in Stripe

  @Column()
  name: string; // The name of the subscription plan (e.g., "Basic Plan")

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // Price of the plan

  @Column()
  currency: string; // Currency of the plan (e.g., "USD")

  @Column()
  interval: SubscriptionInterval; // Billing interval (e.g., "month", "year")

  @Column({ nullable: true })
  description?: string; // Description of the plan

  @Column({ default: false })
  isActive: boolean; // Indicates whether the plan is active

  @Column({ nullable: false, default: 0 })
  trialDays?: number; // Number of trial days for the plan

  @Column({ nullable: false, default: 1 })
  maxDeals?: number;

  @OneToMany(() => Shop, (shop) => shop.activeSubscriptionPlan)
  shops: Shop[];
}
