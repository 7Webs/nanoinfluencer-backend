import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UploadedFile,
  Headers,
  UseInterceptors,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseSecure } from './decorator/firebase.secure.decorator';
import { FirebaseUser } from '../../providers/firebase/firebase.service';
import { FUser } from './decorator/firebase.user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Gender, UserRole } from './entities/user.entity';

@FirebaseSecure()
@ApiTags('User Controller')
@Controller({
  path: 'user',
})
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getProfile(
    @FUser() user: FirebaseUser,
    @Headers('notification-token') token: string | undefined,
  ) {
    return this.userService.getProfile(user, token);
  }

  @Get(':id')
  getProfileById(@Param('id') userId: string) {
    return this.userService.getProfileById(userId);
  }

  @Patch('/')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', default: null, nullable: true },
        birthDate: {
          type: 'string',
          format: 'date-time',
          default: null,
          nullable: true,
        },
        gender: {
          type: 'string',
          enum: Object.values(Gender),
          nullable: true,
        },
        role: {
          type: 'string',
          enum: Object.values(UserRole),
          nullable: true,
        },
        infuencerCategory: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        photo: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        categoryId: { type: 'number', default: null, nullable: true },
        facebookProfileLink: { type: 'string', default: null, nullable: true },
        instagramProfileLink: { type: 'string', default: null, nullable: true },
        tiktokProfileLink: { type: 'string', default: null, nullable: true },
        twitterProfileLink: { type: 'string', default: null, nullable: true },
        youtubeProfileLink: { type: 'string', default: null, nullable: true },
        linkedinProfileLink: { type: 'string', default: null, nullable: true },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfile(
    @FUser() user: FirebaseUser,
    @Body() dto: UpdateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.userService.updateProfile(user, dto, photo);
  }

  @Post('firebase-token')
  updateFirebaseToken(
    @FUser() user: FirebaseUser,
    @Query('isShop') isShop: boolean,
    @Headers('notification-token') token: string | undefined,
  ) {
    return this.userService.updateFirebaseToken(user, token, isShop);
  }

  @Patch('/influencertype/:id/:type')
  updateInfluencerType(
    @Param('id') id: string,
    @Param('type') type: 'pico' | 'nano' | 'micro',
  ) {
    return this.userService.updateInfluencerType(id, type);
  }

  @Delete('/:uid')
  deleteProfile(@Param('uid') uid: string) {
    return this.userService.deleteProfile(uid);
  }
}
