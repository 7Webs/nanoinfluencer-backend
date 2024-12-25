import { HttpException, Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UploaderService } from 'src/providers/uploader/uploader.service';
import { Shop } from './entities/shop.entity';
import { UserShopSearchDto } from './dto/user-shop-search.dto';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
    private uploader: UploaderService,
  ) {}
  async create(
    userId: string,
    createShopDto: CreateShopDto,
    photo?: Express.Multer.File,
    backgroundArt?: Express.Multer.File,
  ) {
    let path: string;
    let backgroundArtPath: string;

    if (photo) {
      path = await this.uploader.uploadFile(photo, 'users/' + userId + '/shop');
    }

    if (backgroundArt) {
      backgroundArtPath = await this.uploader.uploadFile(
        backgroundArt,
        'users/' + userId + '/shop',
        { contentType: 'image/jpeg' },
      );
    }

    const old = await this.shopRepository.findOne({
      where: { owner: { id: userId } },
    });

    if (old) {
      await this.shopRepository.update(old.id, {
        ...createShopDto,
        logo: path,
        backgroundArt: backgroundArtPath,
      });
    } else {
      await this.shopRepository.save({
        ...createShopDto,
        approved: false,
        logo: path,
        backgroundArt: backgroundArtPath,
        owner: { id: userId },
      });
    }

    const shop = await this.shopRepository.findOne({
      where: { owner: { id: userId } },
    });

    return { shop };
  }

  async myShop(owner: string) {
    const shop = await this.shopRepository.findOne({
      where: { owner: { id: owner } },
    });

    if (!shop) throw new HttpException('Not found', 404);

    return shop;
  }

  userShops(
    uid: string,
    { name, approved, take = 50, skip = 0 }: UserShopSearchDto,
  ) {
    return this.shopRepository.find({
      where: {
        name: name ? ILike(`%${name}%`) : undefined,
        approved: approved ? approved === 'true' : true,
      },
      take: take,
      skip: skip,
    });
  }

  async getShop(number: number) {
    const shop = await this.shopRepository.findOne({
      where: { id: number },
    });

    if (!shop) throw new HttpException('Not found', 404);

    return shop;
  }

  async update(userId: string, updateShopDto: UpdateShopDto) {
    let old = await this.shopRepository.findOne({
      where: { owner: { id: userId } },
    });

    if (updateShopDto.id && updateShopDto.id !== old.id) {
      old = await this.shopRepository.findOne({
        where: { id: updateShopDto.id },
      });
    }

    if (!old) throw new HttpException('No shop found', 404);

    await this.shopRepository.update(old.id, {
      ...updateShopDto,
    });

    const shop = await this.shopRepository.findOne({
      where: { owner: { id: updateShopDto.id ? old.owner.id : userId } },
    });

    return { shop };
  }

  remove(id: number) {
    return `This action removes a #${id} shop`;
  }
}
