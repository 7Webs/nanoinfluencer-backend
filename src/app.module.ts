import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DatabaseModule } from './providers/database/database.module';
import { FirebaseModule } from './providers/firebase/firebase.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppCacheModule } from './providers/cache/app.cache.module';
import { UserModule } from './models/user/user.module';
import { NotificationModule } from './providers/notification/notification.module';
import { FirebaseUserMiddlewareExtractor } from './models/user/middleware/firebaseUserMiddlewareExtractor';
import { ShopModule } from './models/shop/shop.module';
import { CategoryModule } from './models/category/category.module';
import { SubscriptionsModule } from './models/subscriptions/subscriptions.module';
import { DealsModule } from './models/deals/deals.module';
import { DealsRedeemModule } from './models/deals-redeem/deals-redeem.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    MulterModule.register({ dest: join(__dirname, '../public/upload') }), // Used to handle file upload
    // ServeStaticModule.forRoot({ rootPath: join(__dirname, '../public') }), // Used to server static files from static routes
    ScheduleModule.forRoot(), // Used to schedule CORN Tasks if required
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }), // Used to load environment variables or any other config
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 10,
      },
    ]), // Used to prevent DDOS Attacks
    DatabaseModule,
    FirebaseModule,
    AppCacheModule,
    NotificationModule,
    UserModule,
    ShopModule,
    CategoryModule,
    SubscriptionsModule,
    DealsModule,
    DealsRedeemModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(FirebaseUserMiddlewareExtractor).forRoutes('*');
  }
}
