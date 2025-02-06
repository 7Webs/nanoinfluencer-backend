import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from './security/jwt.strategy';
// import { AnalyticsModule } from '../analytics/analytics.module';
import { UploaderModule } from '../../providers/uploader/uploader.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from 'src/providers/email/email.module';
import { FirebaseModule } from 'src/providers/firebase/firebase.module';

@Module({
  imports: [
    CacheModule.register(),
    // MailModule,
    // AnalyticsModule,
    EmailModule,
    UploaderModule,
    FirebaseModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ secret: jwtConstants.secret }),
  ],
  controllers: [UserController],
  providers: [JwtStrategy, UserService],
  exports: [UserService],
})
export class UserModule {}
