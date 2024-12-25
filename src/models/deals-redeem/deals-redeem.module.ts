import { Module } from '@nestjs/common';
import { DealsRedeemService } from './deals-redeem.service';
import { DealsRedeemController } from './deals-redeem.controller';

@Module({
  controllers: [DealsRedeemController],
  providers: [DealsRedeemService],
})
export class DealsRedeemModule {}
