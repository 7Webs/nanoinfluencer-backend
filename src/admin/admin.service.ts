import { Injectable } from '@nestjs/common';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersSearchDto } from './dto/search-users.dto';
import { User } from 'src/models/user/entities/user.entity';
import { FindOptionsWhere, ILike, IsNull, Not } from 'typeorm';
import { ShopSearchDto } from './dto/search-shops.dto';
import { Shop } from 'src/models/shop/entities/shop.entity';
import {
  RedeemedDeal,
  RedeemedDealStatus,
} from 'src/models/deals-redeem/entities/deals-redeem.entity';

@Injectable()
export class AdminService {
  async findAllUsers(userSearchDto: UsersSearchDto) {
    const {
      search,
      approved,
      role,
      gender,
      sortBy,
      sortDirection,
      take,
      skip,
    } = userSearchDto;

    const query = User.getRepository()
      .createQueryBuilder('user')
      .where('user.name != :deletedUser', { deletedUser: 'Deleted User' })
      .andWhere('user.owen IS NULL') // Ensure only users without an "owen" value are fetched
      .andWhere(`
      user.facebookProfileLink IS NOT NULL AND user.facebookProfileLink != '' OR
      user.instagramProfileLink IS NOT NULL AND user.instagramProfileLink != '' OR
      user.tiktokProfileLink IS NOT NULL AND user.tiktokProfileLink != '' OR
      user.twitterProfileLink IS NOT NULL AND user.twitterProfileLink != '' OR
      user.youtubeProfileLink IS NOT NULL AND user.youtubeProfileLink != '' OR
      user.linkedinProfileLink IS NOT NULL AND user.linkedinProfileLink != ''
    `); // Ensure at least one social profile link is present

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (approved !== undefined) {
      query.andWhere('user.approved = :approved', { approved });
    }

    if (gender) {
      query.andWhere('user.gender = :gender', { gender });
    }

    if (search) {
      const likeSearch = `%${search}%`;
      query.andWhere(
        '(user.email ILIKE :search OR user.name ILIKE :search OR user.phone ILIKE :search)',
        { search: likeSearch },
      );
    }

    // Sorting
    if (sortBy) {
      query.orderBy(
        `user.${sortBy}`,
        sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      );
    } else {
      query.orderBy('user.createdAt', 'DESC');
    }

    // Pagination
    query.skip(skip || 0).take(take || 10);

    return await query.getMany();
  }

  async approveSingleUser(userId: string, adminId: string) {
    const user = await User.findOne({ where: { id: userId } });
    user.approved = true;
    await user.save();

    return user;
  }

  async blockSingleUser(userId: string, adminId: string) {
    const user = await User.findOne({ where: { id: userId } });
    user.approved = false;
    await user.save();

    return user;
  }

  async findAllShops(shopSearchDto: ShopSearchDto) {
    const {
      search,
      approved,
      categoryId,
      subscriptionState,
      take = 10, // Default number of records to fetch
      skip = 0, // Default number of records to skip
    } = shopSearchDto;

    // Build the dynamic where clause
    const where: FindOptionsWhere<Shop>[] = [];

    // Handle search
    if (search && search.trim() !== '') {
      const likeSearch = `%${search}%`;
      where.push(
        { name: ILike(likeSearch) },
        { email: ILike(likeSearch) },
        { description: ILike(likeSearch) },
      );
    }

    // Add other filters
    if (approved !== undefined) {
      if (where.length === 0) {
        where.push({ approved });
      } else {
        where.forEach((clause) => (clause.approved = approved));
      }
    }

    if (categoryId) {
      if (where.length === 0) {
        where.push({ categoryId });
      } else {
        where.forEach((clause) => (clause.categoryId = categoryId));
      }
    }

    if (subscriptionState) {
      if (where.length === 0) {
        where.push({ subscriptionState });
      } else {
        where.forEach(
          (clause) => (clause.subscriptionState = subscriptionState),
        );
      }
    }

    // Query the database
    return await Shop.find({
      where: where.length > 0 ? where : undefined,
      take: take, // Pagination - number of records
      skip: skip, // Pagination - offset
    });
  }

  async approveSingleShop(shopId: number, adminId: string) {
    const shop = await Shop.findOne({ where: { id: shopId } });
    shop.approved = true;
    await shop.save();
    return shop;
  }

  async blockSingleShop(shopId: number, adminId: string) {
    const shop = await Shop.findOne({ where: { id: shopId } });
    shop.approved = false;
    await shop.save();
    return shop;
  }

  async findAllUsedCoupons(userId: string) {
    const coupons = await RedeemedDeal.find({
      where: {
        status: Not(RedeemedDealStatus.PENDING_USAGE),
      },
      relations: ['deal'],
      withDeleted: true,
      order: {
        usedAt: 'DESC', // Sort by the most recently redeemed coupons
      },
    });

    return coupons;
  }

  async findAllPendingApprovalCoupons(userId: string) {
    return await RedeemedDeal.find({
      where: {
        status: RedeemedDealStatus.PENDING_APPROVAL,
      },
      relations: ['deal'],
      withDeleted: true,
      order: {
        usedAt: 'ASC',
      },
    });
  }
}
