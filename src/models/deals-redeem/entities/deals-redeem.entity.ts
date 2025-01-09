import { randomBytes } from 'crypto';
import { BaseClassEntity } from 'src/common/entities/base.extend-entity';
import { Deal } from 'src/models/deals/entities/deal.entity';
import { User } from 'src/models/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  RelationId,
} from 'typeorm';

export enum RedeemedDealStatus {
  PENDING_USAGE = 'pending_usage',
  PENDING_APPROVAL = 'pending_approval',
  RE_SUBMISSION_REQUESTED = 're_submission_requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
  USED = 'used',
}

@Entity()
export class RedeemedDeal extends BaseClassEntity {
  @Column({ unique: true })
  couponCode: string;

  @Column({ nullable: false, default: RedeemedDealStatus.PENDING_USAGE })
  status: RedeemedDealStatus;

  @ManyToOne(() => Deal, (d) => d.redeemedDeals, {
    nullable: false,
    eager: true,
  })
  deal: Deal;

  @Column({ nullable: false })
  @RelationId((redeemedDeal: RedeemedDeal) => redeemedDeal.deal)
  dealId: number;

  @ManyToOne(() => User, (user) => user.redeemedDeals, {
    nullable: false,
    eager: true,
  })
  user: User;

  @Column({ nullable: false })
  @RelationId((redeemedDeal: RedeemedDeal) => redeemedDeal.user)
  userId: string;

  @Column({ nullable: false, default: false })
  used: boolean;

  @Column({ nullable: true })
  usedAt: Date;

  @Column({ nullable: true })
  socialMediaLink: string;

  @Column({ nullable: true, type: 'simple-array' })
  image: string[];

  @Column({ nullable: true })
  additionalInfo: string;

  @Column({ nullable: true })
  totalViews: number;

  @Column({ nullable: true })
  totalLikes: number;

  @Column({ nullable: true })
  totalComments: number;

  @Column({ nullable: true })
  approved: boolean;

  @Column({ nullable: true })
  approvedAt: Date;

  @ManyToOne(() => User, (user) => user.approvedDeals, {
    nullable: true,
    eager: true,
  })
  approvedBy: User;

  @Column({ nullable: true })
  @RelationId((redeemedDeal: RedeemedDeal) => redeemedDeal.approvedBy)
  approvedById: string;

  @BeforeInsert()
  generateCouponCode() {
    const randomValue = randomBytes(16).toString('hex'); // Generate random bytes
    const md5Hash = require('crypto')
      .createHash('md5')
      .update(randomValue)
      .digest('hex'); // Calculate MD5 hash
    const truncatedMD5 = md5Hash.substring(0, 8); // Take the first 8 characters of the hash
    this.couponCode = truncatedMD5.toUpperCase(); // Set the coupon code
  }

  @BeforeUpdate()
  checkApprovingUserIsAdmin() {
    if (this.approved !== null && !this.approvedBy) {
      throw new Error('Approving user is required when approving a deal');
    }

    if (this.approvedBy && this.approvedBy.role !== 'admin') {
      throw new Error('Only admins can approve a deal');
    }
  }
}
