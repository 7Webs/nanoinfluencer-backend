import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { Column, Entity } from 'typeorm';

export enum RewardType {
  MEAL = 'meal',
  HOTEL_NIGHT = 'hotel_night',
  AMAZON_GIFT_VOUCHER = 'amazon_gift_voucher',
  OTHER = 'other',
}

@Entity()
export class Reward extends BaseClassEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RewardType, default: RewardType.OTHER })
  type: RewardType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  terms: string;

  @Column({ nullable: true })
  validityDays: number;
}