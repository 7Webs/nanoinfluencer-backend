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

@Injectable()
export class DealsRedeemService {
  async checkIfRedeemable(dealId: number, userId: string) {
    const deal = await Deal.findOne({ where: { id: dealId } });
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

    if (!this.checkIfRedeemable(createDealsRedeemDto.dealId, userId)) {
      throw new BadRequestException('You are not allowed to redeem this deal');
    }

    Logger.log(createDealsRedeemDto);

    const redeemedDeal = await RedeemedDeal.create({
      dealId: deal.id,
      user: { id: userId },
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
    });
  }

  async findAllByShop(userId: string, paginationDto: Pagination) {
    const redeems = await RedeemedDeal.find({
      where: { deal: { shop: { owner: { id: userId } } } },
      take: paginationDto.take,
      skip: paginationDto.skip,
      order: { createdAt: 'DESC' },
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
    });
  }

  async update(
    id: number,
    updateDealsRedeemDto: UpdateDealsRedeemDto,
    userId: string,
  ) {
    const redeemedDeal = await RedeemedDeal.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!redeemedDeal || redeemedDeal.userId !== userId) {
      throw new NotFoundException('Redeem not found');
    }

    if (
      !(redeemedDeal.status === RedeemedDealStatus.USED ||
      redeemedDeal.status === RedeemedDealStatus.RE_SUBMISSION_REQUESTED ||
      redeemedDeal.status === RedeemedDealStatus.REJECTED)
    ) {
      throw new BadRequestException(
        'You are not allowed to request approval for this coupon.',
      );
    }

    if (updateDealsRedeemDto.dealId) {
      updateDealsRedeemDto.dealId = redeemedDeal.deal.id;
    }

    console.log(updateDealsRedeemDto);

    await RedeemedDeal.update(id, {
      ...updateDealsRedeemDto,
      status: RedeemedDealStatus.PENDING_APPROVAL,
    });

    return await RedeemedDeal.findOne({
      where: { id: id },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} dealsRedeem`;
  }

  async approve(id: number, userId: string, closeDealsRedeemBodyDto: CloseDealsRedeemDto) {
    const redeemedDeal = await RedeemedDeal.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!redeemedDeal) {
      throw new NotFoundException('Redeem not found');
    }

    if (redeemedDeal.status !== RedeemedDealStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'You are not allowed to approve this coupon.',
      );
    }

    await RedeemedDeal.update(id, {
      status: closeDealsRedeemBodyDto.status,
      approved: closeDealsRedeemBodyDto.status === RedeemedDealStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: { id: userId },
      approvedById: userId
    });

    return await RedeemedDeal.findOne({
      where: { id: id },
    });
  }

}
