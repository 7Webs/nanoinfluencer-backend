import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from '../user/decorator/public.decorator';
import { UserShopSearchDto } from './dto/user-shop-search.dto';

@FirebaseSecure()
@Controller('shop')
@ApiTags('shop')
@ApiBearerAuth()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'backgroundArt', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: false },
        email: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        approved: { type: 'boolean', nullable: true },
        categoryId: { type: 'number', nullable: true },
        id: { type: 'number', nullable: true },
        logo: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        backgroundArt: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  create(
    @Body() createShopDto: CreateShopDto,
    @UploadedFiles() { logo, backgroundArt }: any,
    @FUser() user: FirebaseUser,
  ) {
    return this.shopService.create(
      user.uid,
      createShopDto,
      logo?.[0],
      backgroundArt?.[0],
    );
  }

  @Get()
  findAll(@FUser() user: FirebaseUser) {
    return this.shopService.myShop(user.uid);
  }
  @Get('/user-shops')
  @Public()
  userShops(@FUser() user: FirebaseUser, @Query() dto: UserShopSearchDto) {
    return this.shopService.userShops(user ? user.uid : null, dto);
  }

  @Get(':id')
  @Public()
  getShop(@Param('id') shopId: number) {
    return this.shopService.getShop(shopId);
  }

  @Patch()
  update(@FUser() user: FirebaseUser, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(user.uid, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.shopService.remove(id);
  }
}
