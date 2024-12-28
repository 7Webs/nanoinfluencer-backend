import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { Category } from 'src/models/category/entities/category.entity';
import { Deal } from 'src/models/deals/entities/deal.entity';
import { SubscriptionPlan } from 'src/models/subscriptions/entities/subscription-plan.entity';
import { User } from 'src/models/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

export enum SubscriptionState {
  active = 'active',
  canceled = 'canceled',
  incomplete = 'incomplete',
  incomplete_expired = 'incomplete_expired',
  past_due = 'past_due',
  paused = 'paused',
  trialing = 'trialing',
  unpaid = 'unpaid',
}

@Entity()
export class Shop extends BaseClassEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  backgroundArt?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: true })
  approved: boolean;

  @Column({ nullable: true })
  subscriptionState?: SubscriptionState;

  @Column({ nullable: true })
  subscriptionEndAt?: Date;

  @OneToMany(() => Deal, (d) => d.shop)
  deals: Deal[];

  @ManyToOne(() => Category, (category) => category.shops, {
    nullable: true,
    eager: true, // Load category details with the shop by default
  })
  @JoinColumn()
  category?: Category;

  @RelationId((shop: Shop) => shop.category)
  @Column({ nullable: true })
  categoryId?: number;

  @OneToOne(() => User, (user) => user.owen, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  owner: User;

  @RelationId((shop: Shop) => shop.owner)
  @Column()
  ownerId: string;

  @ManyToOne(
    () => SubscriptionPlan,
    (subscriptionPlan) => subscriptionPlan.shops,
    {
      nullable: true,
      eager: true, // Load active subscription details with the shop
    },
  )
  @JoinColumn()
  activeSubscriptionPlan?: SubscriptionPlan; // The active subscription plan for the shop

  @RelationId((shop: Shop) => shop.activeSubscriptionPlan)
  @Column({ nullable: true })
  activeSubscriptionPlanId?: number; // ID of the active subscription plan
}
