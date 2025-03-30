import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import Stripe from 'stripe';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Shop, SubscriptionState } from '../shop/entities/shop.entity';
import { ProvideSubscriptionDto } from './dto/provide-subscription.dto';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    const {
      name,
      amount,
      interval,
      description,
      trialDays,
      isActive,
      maxDeals,
    } = createSubscriptionPlanDto;

    try {
      // Create a Stripe product
      const product = await this.stripe.products.create({
        name,
        description: description || undefined,
      });

      // Create a Stripe price
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(amount * 100), // Stripe uses cents
        currency: 'EUR', // Default to EUR
        recurring: {
          interval: interval.toLowerCase() as Stripe.Price.Recurring.Interval,
        },
        product: product.id,
        metadata: {
          isActive: String(isActive || false),
          trialDays: String(trialDays || 0),
        },
      });

      // Save to database
      const plan = await SubscriptionPlan.save({
        stripePriceId: price.id,
        name,
        amount,
        currency: 'EUR',
        interval,
        description,
        maxDeals: maxDeals || 1,
        isActive: isActive || false,
        trialDays: trialDays || 0,
      });

      return plan;
    } catch (error) {
      throw new BadRequestException(
        `Error creating subscription plan: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      const subscriptionPlans = await SubscriptionPlan.find();
      return subscriptionPlans;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plans: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const subscriptionPlan = await SubscriptionPlan.findOne({
        where: { id },
      });

      if (!subscriptionPlan) {
        throw new NotFoundException(
          `Subscription plan with ID ${id} not found`,
        );
      }

      return subscriptionPlan;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plan: ${error.message}`,
      );
    }
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    try {
      const subscriptionPlan = await SubscriptionPlan.findOne({
        where: { id },
      });

      if (!subscriptionPlan) {
        throw new NotFoundException(
          `Subscription plan with ID ${id} not found`,
        );
      }

      Object.assign(subscriptionPlan, updateSubscriptionDto);

      await subscriptionPlan.save();
      return subscriptionPlan;
    } catch (error) {
      throw new BadRequestException(
        `Error updating subscription plan: ${error.message}`,
      );
    }
  }

  async remove(id: number) {
    try {
      const subscriptionPlan = await SubscriptionPlan.findOne({
        where: { id },
      });

      if (!subscriptionPlan) {
        throw new NotFoundException(
          `Subscription plan with ID ${id} not found`,
        );
      }

      await SubscriptionPlan.softRemove(subscriptionPlan);
      return {
        message: `Subscription plan with ID ${id} removed successfully`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error removing subscription plan: ${error.message}`,
      );
    }
  }

  async pay(id: number, host: string, userId: string) {
    try {
      const subscriptionPlan = await SubscriptionPlan.findOne({
        where: { id },
      });

      if (!subscriptionPlan) {
        throw new NotFoundException(
          `Subscription plan with ID ${id} not found`,
        );
      }

      const user = await User.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const shop = await Shop.findOne({
        where: { owner: { id: userId } },
      });

      if (!shop || !shop.approved) {
        throw new NotFoundException(`Shop with owner ID ${userId} not found`);
      }
      const customer = await this.setupCustomer(user);

      const oldSubscription = await this.stripe.subscriptions.list({
        customer: customer.id,
      });
      const price = await this.stripe.prices.retrieve(
        subscriptionPlan.stripePriceId,
      );

      if (
        oldSubscription.data.length > 0 &&
        oldSubscription.data[0].items.data[0].price.id == price.id
      ) {
        return await this.stripe.billingPortal.sessions.create({
          customer: customer.id,
        });
      } else {
        await this.stripe.subscriptions.cancel(oldSubscription.data[0].id);
      }

      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          planId: subscriptionPlan.id,
          planName: subscriptionPlan.name,
          planAmount: subscriptionPlan.amount,
          purchaseAt: new Date().toISOString(),
          shopId: shop.id,
        },
        customer: customer.id,
        mode: 'subscription',
        success_url: `https://${host}/subscriptions/payment-success/{CHECKOUT_SESSION_ID}`,
        cancel_url: `https://${host}/subscriptions/payment-failed`,
      });

      return session.url;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plan: ${error.message}`,
      );
    }
  }

  async giveSubscription(giveSubscriptionDto: ProvideSubscriptionDto) {
    try {
      const subscriptionPlan = await SubscriptionPlan.findOne({
        where: { id: giveSubscriptionDto.planId },
      });

      if (!subscriptionPlan) {
        throw new NotFoundException(
          `Subscription plan with ID ${giveSubscriptionDto.planId} not found`,
        );
      }

      const shop = await Shop.findOne({
        where: { id: giveSubscriptionDto.shopId },
      });

      if (!shop) {
        throw new NotFoundException(
          `Shop with ID ${giveSubscriptionDto.shopId} not found`,
        );
      }

      shop.subscriptionState = SubscriptionState.active;
      shop.activeSubscriptionPlan = subscriptionPlan;
      shop.monthlyCollabs = subscriptionPlan.maxDeals;
      shop.remainingCollabs =
        parseInt(shop.remainingCollabs.toString()) +
        parseInt(subscriptionPlan.maxDeals.toString());
      shop.planActivatedAt = new Date();
      shop.subscriptionEndAt = new Date(
        new Date().setMonth(new Date().getMonth() + giveSubscriptionDto.months),
      );

      await Shop.save(shop);

      return shop;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plan: ${error.message}`,
      );
    }
  }

  async addCollabs(noOfCollabs: number, shopId: number) {
    try {
      const shop = await Shop.findOne({
        where: { id: shopId },
      });

      if (!shop) {
        throw new NotFoundException(`Shop with ID ${shopId} not found`);
      }

      shop.remainingCollabs =
        parseInt(shop.remainingCollabs.toString()) +
        parseInt(noOfCollabs.toString());

      await Shop.save(shop);

      return shop;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plan: ${error.message}`,
      );
    }
  }

  async paymentSuccess(checkoutSessionId: string) {
    try {
      // console.log(checkoutSessionId);
      const session =
        await this.stripe.checkout.sessions.retrieve(checkoutSessionId);

      const planId = session.metadata.planId;
      const planName = session.metadata.planName;
      const planAmount = session.metadata.planAmount;
      const purchaseAt = session.metadata.purchaseAt;
      const shopId = session.metadata.shopId;

      const subscriptionPlan = await SubscriptionPlan.findOne({
        where: { id: Number(planId) },
      });

      if (!subscriptionPlan) {
        throw new NotFoundException(
          `Subscription plan with ID ${planId} not found`,
        );
      }

      const shop = await Shop.findOne({
        where: { id: Number(shopId) },
      });

      if (!shop) {
        throw new NotFoundException(`Shop with ID ${shopId} not found`);
      }

      shop.subscriptionState = SubscriptionState.active;
      shop.activeSubscriptionPlan = subscriptionPlan;
      shop.planActivatedAt = new Date(purchaseAt);
      shop.subscriptionEndAt = new Date(
        shop.subscriptionEndAt.setFullYear(new Date().getFullYear() + 1),
      );
      shop.monthlyCollabs = subscriptionPlan.maxDeals;
      shop.remainingCollabs = subscriptionPlan.maxDeals;

      await Shop.save(shop);

      // return 'http://localhost:3000/api'
      return `Payment successful! Subscription plan: ${planName}, Amount: ${planAmount}, Purchase Date: ${purchaseAt}, Shop: ${shop.name}`;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plan: ${error.message}`,
      );
    }
  }

  /** get customer id from stripe  */
  async setupCustomer(user: User) {
    const users = await this.stripe.customers.list({
      email: user.email,
    });

    if (users.data.length == 0) return this.createCustomer(user);

    return users.data[0];
  }

  async createCustomer(user: User) {
    const response = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      phone: user.phone,
    });

    return response;
  }

  async syncSubscription(data) {
    const customer = data.customer;
    const status = data.status;
    const customerData = (await this.stripe.customers.retrieve(
      customer,
    )) as Stripe.Customer;

    const user = await User.findOne({
      where: { email: customerData.email },
    });

    if (!user) return;

    await Shop.update(
      { owner: { id: user.id } },
      { subscriptionState: status },
    );
  }

  async webhook(body: string, stripeSignature: any) {
    const event = await this.stripe.webhooks.constructEventAsync(
      body,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const data = event.data.object as any;

    if (event.type.match(/customer\.subscription.*/)) {
      this.syncSubscription(data);
    }
  }
  async testWebhook(body: string, stripeSignature: any) {
    const event = await this.stripe.webhooks.constructEventAsync(
      body,
      stripeSignature,
      process.env.STRIPE_TEST_WEBHOOK_SECRET,
    );

    const data = event.data.object as any;

    if (event.type.match(/customer\.subscription.*/)) {
      this.syncSubscription(data);
    }
  }
  async getMySubscription(userId: string) {
    const user = await User.findOne({ where: { id: userId } });
    const customer = await this.setupCustomer(user);

    const data = await this.stripe.subscriptions.list({
      customer: customer.id,
    });

    return data.data[0];
  }

  async cancelMySubscription(userId: string) {
    const subscription = await this.getMySubscription(userId);

    if (!subscription) throw new HttpException('No subscription found', 404);

    await this.stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    const shop = await Shop.findOne({ where: { owner: { id: userId } } });
    shop.subscriptionState = SubscriptionState.canceled;
    shop.activeSubscriptionPlan = null;
    shop.planActivatedAt = null;
    shop.subscriptionEndAt = null;
    shop.remainingCollabs = 0;
    shop.monthlyCollabs = 0;

    await Shop.save(shop);

    return { done: true };
  }

  async customerPortal(userId: string) {
    const user = await User.findOne({ where: { id: userId } });
    const customer = await this.setupCustomer(user);

    const data = await this.stripe.billingPortal.sessions.create({
      customer: customer.id,
    });

    return data;
  }

  async syncMySubscription(id: string) {
    const user = await User.findOne({ where: { id } });
    const customer = await this.setupCustomer(user);

    const subscription = await this.stripe.subscriptions.list({
      customer: customer.id,
    });

    if (subscription.data.length === 0) return;
  }
}
