import { Injectable } from '@nestjs/common';
import { CreateDealsRedeemDto } from './dto/create-deals-redeem.dto';
import { UpdateDealsRedeemDto } from './dto/update-deals-redeem.dto';

@Injectable()
export class DealsRedeemService {
  create(createDealsRedeemDto: CreateDealsRedeemDto) {
    return 'This action adds a new dealsRedeem';
  }

  findAll() {
    return `This action returns all dealsRedeem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dealsRedeem`;
  }

  update(id: number, updateDealsRedeemDto: UpdateDealsRedeemDto) {
    return `This action updates a #${id} dealsRedeem`;
  }

  remove(id: number) {
    return `This action removes a #${id} dealsRedeem`;
  }
}
