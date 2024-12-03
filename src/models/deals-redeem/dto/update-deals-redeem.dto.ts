import { PartialType } from '@nestjs/swagger';
import { CreateDealsRedeemDto } from './create-deals-redeem.dto';

export class UpdateDealsRedeemDto extends PartialType(CreateDealsRedeemDto) {}
