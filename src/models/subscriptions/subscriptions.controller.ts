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
  Req,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { Public } from '../user/decorator/public.decorator';
import { ProvideSubscriptionDto } from './dto/provide-subscription.dto';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';

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
  pay(
    @Param('id') id: string,
    @Headers('host') host: string,
    @FUser() user: any,
  ) {
    return this.subscriptionsService.pay(+id, host, user.uid);
  }

  @Post('give-subscription')
  giveSubscription(@Body() giveSubscriptionDto: ProvideSubscriptionDto) {
    return this.subscriptionsService.giveSubscription(giveSubscriptionDto);
  }

  @Post('add-collabs/:shopId/:noOfCollabs')
  addCollabs(
    @Param('noOfCollabs') noOfCollabs: number,
    @Param('shopId') shopId: number,
  ) {
    return this.subscriptionsService.addCollabs(noOfCollabs, shopId);
  }

  @Public()
  @Get('payment-success/:checkoutsessionid')
  async paymentSuccess(
    @Param('checkoutsessionid') checkoutSessionId: string,
    @Res() res,
    @Headers('origin') origin: string,
  ) {
    await this.subscriptionsService.paymentSuccess(checkoutSessionId);

    console.log(origin);

    return res.redirect(`https://vendor.nanoinfluencers.io/profile`);
  }

  @Public()
  @Get('payment-failed')
  async paymentFail(@Res() res, @Headers('origin') origin: string) {
    // await this.subscriptionsService.paymentSuccess(checkoutSessionId);

    return res.redirect(`https://vendor.nanoinfluencers.io`);
  }

  @Public()
  @ApiExcludeEndpoint()
  @Post('webhook')
  webhook(@Req() req, @Headers('stripe-signature') stripeSignature) {
    return this.subscriptionsService.webhook(req.rawBody, stripeSignature);
  }

  @Post('sync-subscription')
  syncSubscription(@FUser() user: FirebaseUser) {
    return this.subscriptionsService.syncMySubscription(user?.uid);
  }

  @Get('my-subscription')
  getMySubscription(@FUser() user: FirebaseUser) {
    return this.subscriptionsService.getMySubscription(user?.uid);
  }

  @Delete('/cancel-subscription')
  cancelSubscription(@FUser() user: FirebaseUser) {
    return this.subscriptionsService.cancelMySubscription(user?.uid);
  }

  @Get('/customer-portal')
  customerPortal(@FUser() user: FirebaseUser) {
    return this.subscriptionsService.customerPortal(user?.uid);
  }
}
