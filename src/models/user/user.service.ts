import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Gender, User } from './entities/user.entity';
import {
  FirebaseService,
  FirebaseUser,
} from '../../providers/firebase/firebase.service';
import { UploaderService } from '../../providers/uploader/uploader.service';
import { NotificationService } from 'src/providers/notification/notification.service';
import {
  RedeemedDeal,
  RedeemedDealStatus,
} from '../deals-redeem/entities/deals-redeem.entity';
import { EmailService } from 'src/providers/email/email.service';
import { Deal } from '../deals/entities/deal.entity';

@Injectable()
export class UserService {
  constructor(
    // private analyticsService: AnalyticsService,
    private uploader: UploaderService,
    private notificationService: NotificationService,
    private emailService: EmailService,
    private firebaseService: FirebaseService,
  ) {}

  updateToken(uid: string, token: string) {
    return this.notificationService.updateToken(uid, token);
  }

  async getProfile(fUser: FirebaseUser, token?: string) {
    const user = await User.createQueryBuilder('user')
      .leftJoinAndSelect('user.owen', 'owen')
      .leftJoinAndSelect('user.category', 'category')
      .leftJoinAndSelect('category.relatedCategories', 'relatedCategories')
      // .leftJoinAndSelect(
      //   'user.owen.activeSubscriptionPlan',
      //   'activeSubscriptionPlan',
      // )
      .where('user.id = :userId', { userId: fUser.uid })
      .getOne();

    // await this.emailService.sendAccountPendingEmail(fUser.email, fUser.name);

    if (!user) return this.createUserProfile(fUser);

    if (token) this.updateToken(fUser.uid, token);

    const openRedeemedDeal = await RedeemedDeal.findOne({
      where: {
        user: { id: fUser.uid },
        status: RedeemedDealStatus.PENDING_USAGE,
      },
      relations: ['deal'],
      withDeleted: true,
    });

    if (openRedeemedDeal) {
      user.openRedeemedDeal = openRedeemedDeal;
    }

    return user;
  }

  async getProfileById(uid: string) {
    const user = await User.findOne({
      where: { id: uid },
      relations: ['owen'],
      withDeleted: true,
    });

    if (user.openRedeemedDeal) {
      if (!user.openRedeemedDeal.deal) {
        const deletedDeal = await Deal.findOne({
          where: { id: user.openRedeemedDeal.dealId },
          withDeleted: true,
        });
        user.openRedeemedDeal.deal = deletedDeal;
      }
    }
    return user;
  }

  async createUserProfile(fUser: FirebaseUser) {
    const { uid, email, phone_number, picture } = fUser;
    await User.save({
      id: uid,
      email,
      phone: phone_number,
      photo: picture,
    });

    await this.emailService.sendAccountPendingEmail(
      fUser.email,
      fUser.name ?? fUser.email,
    );
    await this.emailService.sendNewAccountNotificationToAdmin(fUser);

    return this.getProfile(fUser);
  }

  async updateProfile(
    fUser: FirebaseUser,
    {
      name,
      gender,
      birthDate,
      phone,
      role,
      location,
      categoryId,
      facebookProfileLink,
      twitterProfileLink,
      instagramProfileLink,
      youtubeProfileLink,
      linkedinProfileLink,
      tiktokProfileLink,
      infuencerCategory,
    }: UpdateUserDto,
    photo?: Express.Multer.File,
  ) {
    const { uid, email } = fUser;

    let path: string;
    if (photo) {
      path = await this.uploader.uploadFile(photo, 'users/' + uid);
    }

    await User.update(uid, {
      photo: path,
      name,
      gender,
      birthDate,
      email,
      phone,
      location,
      role,
      categoryId,
      facebookProfileLink,
      twitterProfileLink,
      instagramProfileLink,
      youtubeProfileLink,
      linkedinProfileLink,
      tiktokProfileLink,
    });

    return this.getProfile(fUser);
  }

  async deleteProfile(uid: string) {
    const user = await User.findOne({ where: { id: uid } });

    user.name = 'Deleted User';
    user.email = 'deleteduser@nanoinfluencers.io';
    user.birthDate = null;
    user.gender = Gender.preferNotToSay;
    user.photo = null;
    user.phone = null;

    user.facebookProfileLink = null;
    user.twitterProfileLink = null;
    user.instagramProfileLink = null;
    user.youtubeProfileLink = null;
    user.linkedinProfileLink = null;
    user.tiktokProfileLink = null;

    await User.save(user);

    // Delete User From Firebase
    await this.firebaseService.deleteUserFromFirebase(uid);

    return user;
  }

  async updateFirebaseToken(
    user: FirebaseUser,
    token: string,
    isShop?: boolean,
  ) {
    await this.notificationService.updateToken(user.uid, token, isShop);
    return { done: true };
  }

  async updateInfluencerType(id: string, type: 'pico' | 'nano' | 'micro') {
    await User.update(id, { infuencerCategory: type });
    return { done: true };
  }
}
