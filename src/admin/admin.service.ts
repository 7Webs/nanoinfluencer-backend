import { Injectable } from '@nestjs/common';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersSearchDto } from './dto/search-users.dto';
import { User } from 'src/models/user/entities/user.entity';
import { FindOptionsWhere, ILike, Not } from 'typeorm';
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

    // Base where clause
    const baseWhere: FindOptionsWhere<User> = {};

    if (role) {
      baseWhere.role = role;
    }

    if (approved !== undefined) {
      baseWhere.approved = approved;
    }

    if (gender) {
      baseWhere.gender = gender;
    }

    // Dynamic search filter
    let searchConditions: FindOptionsWhere<User>[] = [];
    if (search) {
      const likeSearch = `%${search}%`; // Add wildcard for partial matching
      searchConditions = [
        { ...baseWhere, email: ILike(likeSearch) },
        { ...baseWhere, name: ILike(likeSearch) },
        { ...baseWhere, phone: ILike(likeSearch) },
      ];
    }

    return await User.find({
      where: searchConditions.length > 0 ? searchConditions : baseWhere,
      order: sortBy ? { [sortBy]: sortDirection || 'ASC' } : undefined,
      take: take || 10, // Default to 10 if not specified
      skip: skip || 0, // Default to 0 if not specified
    });
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
      order: {
        usedAt: 'ASC',
      },
    });
  }
}
