import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FirebaseUser } from '../../providers/firebase/firebase.service';
import { UploaderService } from '../../providers/uploader/uploader.service';
import { NotificationService } from 'src/providers/notification/notification.service';
import {
  RedeemedDeal,
  RedeemedDealStatus,
} from '../deals-redeem/entities/deals-redeem.entity';

@Injectable()
export class UserService {
  constructor(
    // private analyticsService: AnalyticsService,
    private uploader: UploaderService,
    private notificationService: NotificationService,
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

    if (!user) return this.createUserProfile(fUser);

    if (token) this.updateToken(fUser.uid, token);

    const openRedeemedDeal = await RedeemedDeal.findOne({
      where: {
        user: { id: fUser.uid },
        status: RedeemedDealStatus.PENDING_USAGE,
      },
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
    });
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
      categoryId,
      facebookProfileLink,
      twitterProfileLink,
      instagramProfileLink,
      youtubeProfileLink,
      linkedinProfileLink,
      tiktokProfileLink,
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
    await User.getRepository().softRemove({ id: uid });
  }

  async updateFirebaseToken(
    user: FirebaseUser,
    token: string,
    isShop?: boolean,
  ) {
    await this.notificationService.updateToken(user.uid, token, isShop);
    return { done: true };
  }
}
