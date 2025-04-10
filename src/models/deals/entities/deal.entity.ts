import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { Shop } from '../../shop/entities/shop.entity';
import { Category } from 'src/models/category/entities/category.entity';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { RedeemedDeal } from 'src/models/deals-redeem/entities/deals-redeem.entity';

export enum DealType {
  DEAL = 'deal',
}

@Entity()
export class Deal extends BaseClassEntity {
  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ nullable: true })
  video: string;

  @Index({ fulltext: true })
  @Column()
  title: string;

  @Column({ nullable: false, default: DealType.DEAL })
  type: DealType;

  @Index({ fulltext: true })
  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'text', default: '' })
  features: string;

  @Index({ fulltext: true })
  @Column()
  keywords: string;

  @Column({ nullable: true })
  influencerRequirements: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  availableUntil: Date;

  @ManyToOne(() => Shop, (s) => s.deals, { nullable: false, eager: true })
  shop: Shop;

  @RelationId((deal: Deal) => deal.shop)
  shopId: number;

  @Column({ nullable: true })
  shortTagLine: string;

  @Column({ nullable: true, default: 0 })
  maxPurchaseLimit: number;

  @Column({ nullable: true, default: 0 })
  maxPurchasePerUser: number;

  @ManyToOne(() => Category, (c) => c.deals, { nullable: true, eager: true })
  category: Category;

  @RelationId((deal: Deal) => deal.category)
  @Column({ nullable: false })
  categoryId?: number;

  @OneToMany(() => RedeemedDeal, (redeemedDeal) => redeemedDeal.deal)
  redeemedDeals: RedeemedDeal[];

  @Column({ nullable: true, type: 'float', default: 0 })
  percentOff: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  uptoAmount: number; 

  @Column({ nullable: true, type: 'float', default: 0 })
  minSpend: number; 

  @Column({ nullable: true, type: 'float', default: 0 })
  maxSpend: number; 
}
