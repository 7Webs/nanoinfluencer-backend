import { Module } from '@nestjs/common';
import { DealsRedeemService } from './deals-redeem.service';
import { DealsRedeemController } from './deals-redeem.controller';
import { UploaderModule } from 'src/providers/uploader/uploader.module';
import { EmailModule } from 'src/providers/email/email.module';

@Module({
  imports: [UploaderModule, EmailModule],
  controllers: [DealsRedeemController],
  providers: [DealsRedeemService],
})
export class DealsRedeemModule {}
