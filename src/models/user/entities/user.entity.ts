import { JwtService } from '@nestjs/jwt';
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { NotificationToken } from 'src/providers/notification/entities/notificationToken.entity';
import { Shop } from 'src/models/shop/entities/shop.entity';
import { Category } from 'src/models/category/entities/category.entity';
import { RedeemedDeal } from 'src/models/deals-redeem/entities/deals-redeem.entity';

export enum UserRole {
  user = 'user',
  admin = 'admin',
  shopowner = 'shopowner',
}

export enum Gender {
  male = 'Male',
  female = 'Female',
  preferNotToSay = 'Prefer not to say',
}

@Entity()
export class User extends BaseEntity {
  static from(partial: Partial<User>): User {
    const user = new User();
    Object.assign(user, partial);
    return user;
  }

  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: ['user', 'shopowner', 'admin'],
    default: 'user',
  })
  role: UserRole;

  @Column({ nullable: true })
  facebookProfileLink?: string;

  @Column({ nullable: true })
  instagramProfileLink?: string;

  @Column({ nullable: true })
  tiktokProfileLink?: string;

  @Column({ nullable: true })
  twitterProfileLink?: string;

  @Column({ nullable: true })
  youtubeProfileLink?: string;

  @Column({ nullable: true })
  linkedinProfileLink?: string;

  @ManyToOne(() => Category, (category) => category.users, {
    nullable: true,
    eager: true, // Load category details with the shop by default
  })
  @JoinColumn()
  category?: Category;

  @RelationId((shop: Shop) => shop.category)
  @Column({ nullable: true })
  categoryId?: number;

  @OneToOne(() => Shop, (shop) => shop.owner, { onDelete: 'CASCADE' })
  owen: Shop;

  @OneToMany(() => NotificationToken, (nt) => nt.user, { onDelete: 'CASCADE' })
  notificationTokens: NotificationToken[];

  @OneToMany(() => RedeemedDeal, (d) => d.user, {
    onDelete: 'CASCADE',
  })
  redeemedDeals: RedeemedDeal[];

  @OneToMany(() => RedeemedDeal, (d) => d.user, {
    onDelete: 'CASCADE',
  })
  approvedDeals: RedeemedDeal[];

  toReturnJson() {
    const { id, name, email, phone, photo, role, birthDate } = this;

    return { id, name, email, phone, photo, role, birthDate };
  }

  withJWT(jwtService: JwtService) {
    return {
      ...this,
      token: jwtService.sign({
        id: this.id,
        email: this.email,
        role: this.role,
      }),
    };
  }
}
