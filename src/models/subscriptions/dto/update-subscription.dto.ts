import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionPlanDto } from './create-subscription-plan.dto';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionPlanDto) {}
