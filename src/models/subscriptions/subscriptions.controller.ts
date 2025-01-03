import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Res,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { Public } from '../user/decorator/public.decorator';

@Controller('subscriptions')
@FirebaseSecure()
@ApiBearerAuth()
@ApiTags('Subscription Plans')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }

  @Get('pay/:id')
  pay(@Param('id') id: string, @Headers('host') host: string, @FUser() user: any) {
    return this.subscriptionsService.pay(+id, host, user.uid);
  }

  @Get('payment-success/:checkoutsessionid')
  @Public()
  async paymentSuccess( @Param('checkoutsessionid') checkoutSessionId: string, @Res() res) {
    await this.subscriptionsService.paymentSuccess(checkoutSessionId);

    return res.redirect('http://localhost:5174/');

  }
}
