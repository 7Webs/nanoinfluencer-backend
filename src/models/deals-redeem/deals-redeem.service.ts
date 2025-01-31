import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDealsRedeemDto } from './dto/create-deals-redeem.dto';
import { UpdateDealsRedeemDto } from './dto/update-deals-redeem.dto';
import { User } from '../user/entities/user.entity';
import { Deal } from '../deals/entities/deal.entity';
import {
  RedeemedDeal,
  RedeemedDealStatus,
} from './entities/deals-redeem.entity';
import { Pagination } from 'src/common/dtos/pagination.dto';
import { CloseDealsRedeemDto } from './dto/close-redeem.dto';
import { UploaderService } from 'src/providers/uploader/uploader.service';
import { Shop } from '../shop/entities/shop.entity';

@Injectable()
export class DealsRedeemService {
  constructor(private uploader: UploaderService) {}
  async checkIfRedeemable(dealId: number, userId: string) {
    const deal = await Deal.findOne({ where: { id: dealId } });
    if (deal.shop.remainingCollabs <= 0) {
      return false;
    }
    const alreadyRedeemedSameDeal = await RedeemedDeal.find({
      where: { deal: { id: dealId } },
    });
    const alreadyRedeemedSameDealBySameUser = await RedeemedDeal.find({
      where: { deal: { id: dealId }, user: { id: userId } },
    });
    const anyOpenDealBySameUser = await RedeemedDeal.find({
      where: { user: { id: userId }, status: RedeemedDealStatus.PENDING_USAGE },
    });

    if (anyOpenDealBySameUser.length > 0) {
      return false;
    } else if (
      alreadyRedeemedSameDealBySameUser.length < deal.maxPurchasePerUser &&
      alreadyRedeemedSameDeal.length < deal.maxPurchaseLimit
    ) {
      return true;
    } else {
      return false;
    }
  }

  async create(createDealsRedeemDto: CreateDealsRedeemDto, userId: string) {
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deal = await Deal.findOne({
      where: { id: createDealsRedeemDto.dealId },
    });

    Logger.log(createDealsRedeemDto.dealId);

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (!(await this.checkIfRedeemable(createDealsRedeemDto.dealId, userId))) {
      throw new BadRequestException('You are not allowed to redeem this deal');
    }

    Logger.log(createDealsRedeemDto);

    const redeemedDeal = await RedeemedDeal.create({
      dealId: deal.id,
      user: { id: userId },
    });

    await Shop.update(deal.shop.id, {
      remainingCollabs: deal.shop.remainingCollabs - 1,
    });
    // return deal;

    await redeemedDeal.save();

    return RedeemedDeal.findOne({
      where: { id: redeemedDeal.id },
    });
  }

  async findAllByUser(userId: string, paginationDto: Pagination) {
    return await RedeemedDeal.find({
      where: { user: { id: userId } },
      take: paginationDto.take,
      skip: paginationDto.skip,
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
  }

  async findAllByShop(userId: string, paginationDto: Pagination) {
    const redeems = await RedeemedDeal.find({
      where: { deal: { shop: { owner: { id: userId } } } },
      take: paginationDto.take,
      skip: paginationDto.skip,
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });

    for (const redeem of redeems) {
      redeem.couponCode = '********';
    }

    return redeems;
  }

  findAll() {
    return `This action returns all dealsRedeem`;
  }

  findOne(id: number) {
    return RedeemedDeal.findOne({
      where: { id: id },
      withDeleted: true,
    });
  }

  async update(
    id: number,
    updateDealsRedeemDto: UpdateDealsRedeemDto,
    userId: string,
    image: Express.Multer.File[],
  ) {
    const redeemedDeal = await RedeemedDeal.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!redeemedDeal || redeemedDeal.userId !== userId) {
      throw new NotFoundException('Redeem not found');
    }

    // console.log(updateDealsRedeemDto);

    if (
      !(
        redeemedDeal.status === RedeemedDealStatus.USED ||
        redeemedDeal.status === RedeemedDealStatus.RE_SUBMISSION_REQUESTED ||
        redeemedDeal.status === RedeemedDealStatus.REJECTED
      )
    ) {
      throw new BadRequestException(
        'You are not allowed to request approval for this coupon.',
      );
    }

    if (updateDealsRedeemDto.dealId) {
      updateDealsRedeemDto.dealId = redeemedDeal.deal.id;
    }

    // console.log(updateDealsRedeemDto);

    let imagePath: string[];

    if (image) {
      imagePath = await this.uploader.uploadFiles(
        image,
        'deal/' + redeemedDeal.id,
      );
      console.log(imagePath);
      redeemedDeal.image = imagePath;
    }

    await RedeemedDeal.update(id, {
      ...updateDealsRedeemDto,
      image: imagePath,
      status: RedeemedDealStatus.PENDING_APPROVAL,
    });

    return await RedeemedDeal.findOne({
      where: { id: id },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} dealsRedeem`;
  }

  async approve(
    id: number,
    userId: string,
    closeDealsRedeemBodyDto: CloseDealsRedeemDto,
  ) {
    const redeemedDeal = await RedeemedDeal.findOne({
      where: { id: id },
      withDeleted: true,
    });

    if (!redeemedDeal) {
      throw new NotFoundException('Redeem not found');
    }

    if (redeemedDeal.status !== RedeemedDealStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `This coupon is in ${redeemedDeal.status} status. Only a submitted for approval coupon can be approved.`,
      );
    }

    await RedeemedDeal.update(id, {
      status: closeDealsRedeemBodyDto.status,
      approved: closeDealsRedeemBodyDto.status === RedeemedDealStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: { id: userId },
      approvedById: userId,
    });

    return await RedeemedDeal.findOne({
      where: { id: id },
    });
  }

  async use(couponcode: string, userId: string) {
    const redeemedDeal = await RedeemedDeal.findOne({
      where: { couponCode: couponcode },
    });

    if (!redeemedDeal) {
      throw new NotFoundException('Coupon not found');
    }

    if (redeemedDeal.deal.shop.ownerId !== userId) {
      throw new NotFoundException('Coupon not found');
    }

    if (redeemedDeal.status !== RedeemedDealStatus.PENDING_USAGE) {
      throw new BadRequestException(
        'This coupon has already been used or expired.',
      );
    }

    await RedeemedDeal.update(redeemedDeal.id, {
      status: RedeemedDealStatus.USED,
      used: true,
      usedAt: new Date(),
    });

    return await RedeemedDeal.findOne({
      where: { id: redeemedDeal.id },
    });
  }

  async findOneByCoupon(couponcode: string) {
    return await RedeemedDeal.findOne({
      where: { couponCode: couponcode },
      withDeleted: true,
    });
  }
}
