import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import Stripe from 'stripe';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Shop, SubscriptionState } from '../shop/entities/shop.entity';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    const { name, amount, interval, description, trialDays, isActive } =
      createSubscriptionPlanDto;

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

      await SubscriptionPlan.remove(subscriptionPlan);
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

      const price = await this.stripe.prices.retrieve(
        subscriptionPlan.stripePriceId,
      );

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

  async paymentSuccess(checkoutSessionId: string, ) {
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

      await Shop.save(shop);

      // return 'http://localhost:3000/api'
      return `Payment successful! Subscription plan: ${planName}, Amount: ${planAmount}, Purchase Date: ${purchaseAt}, Shop: ${shop.name}`;
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving subscription plan: ${error.message}`,
      );
    }
  }
}
