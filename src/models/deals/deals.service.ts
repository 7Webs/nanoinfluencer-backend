import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { User } from '../user/entities/user.entity';
import { UploaderService } from '../../providers/uploader/uploader.service';
import { Deal } from './entities/deal.entity';
import { DealSearchDto } from './dto/deal.search.dto';
import { Brackets, EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AdminDealSearchDto } from './dto/AdminSearchDeal.dto';
import { Pagination } from 'src/common/dtos/pagination.dto';

@Injectable()
export class DealsService {
  private logger = new Logger(DealsService.name);

  constructor(
    private readonly uploader: UploaderService,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async create(
    userId: string,
    createDealDto: CreateDealDto,
    photos: Express.Multer.File[],
    video?: Express.Multer.File,
  ) {
    const user = await User.findOne({
      where: { id: userId },
      relations: [  'owen'],
    });

    if (!user.owen?.approved ) {
      throw new UnauthorizedException(
        'You have no active shop to create a deal',
      );
    }

    const imagesPaths = await this.uploader.uploadFiles(
      photos,
      `users/${(user.owen).ownerId}/shop/deals`,
    );

    const videoPath = !video
      ? null
      : await this.uploader.uploadFile(
          video,
          `users/${(user.owen  ).ownerId}/shop/deals`,
        );

    const deal = await Deal.save({
      ...createDealDto,
      images: imagesPaths,
      video: videoPath,
      shop: { id: (user.owen  ).id },
    });

    return await Deal.findOne({
      where: { id: deal.id },
      relations: ['shop'],
    });
  }

  async update(
    userId: string,
    id: number,
    updateDealDto: UpdateDealDto,
    photos?: Express.Multer.File[],
    video?: Express.Multer.File,
  ) {
    const user = await User.findOne({
      where: { id: userId },
      relations: [  'owen'],
    });

    const deal = await Deal.findOne({ where: { id }, relations: ['shop',  ] });

    if ( deal.shopId != user.owen.id)
      throw new UnauthorizedException();

    const imagePath = !photos
      ? undefined
      : await this.uploader.uploadFiles(
          photos,
          `users/${(user.owen  ).ownerId}/shop/deals`,
        );
    if (imagePath) {
      updateDealDto.images ??= [];
      updateDealDto.images.push(...imagePath);
    }

    const videoPath = !video
      ? undefined
      : await this.uploader.uploadFile(
          video,
          `users/${(user.owen  ).ownerId}/shop/deals`,
        );

    await Deal.update(id, {
      video: videoPath,
      title: updateDealDto.title,
      description: updateDealDto.description,
      keywords: updateDealDto.keywords,
      availableUntil: updateDealDto.availableUntil,
      features: updateDealDto.features,
      images: updateDealDto.images,
      categoryId: updateDealDto.categoryId,
      shortTagLine: updateDealDto.shortTagLine,
      maxPurchaseLimit: updateDealDto.maxPurchaseLimit,
      maxPurchasePerUser: updateDealDto.maxPurchasePerUser,
    });



    return await Deal.findOne({
      where: { id },
      relations: ['shop',  ],
    });
  }

  async myShopDeals(userId: string, pagination: Pagination) {
    const user = await User.findOne({
      where: { id: userId },
      relations: [  'owen'],
    });

    return await Deal.find({
      where: { shop: { id: (user.owen  ).id } },
      relations: ['shop',  ],
      take: pagination.take,
      skip: pagination.skip,
      order: { createdAt: 'DESC' },
    });
  }

  async topDeals(userId: string | undefined, pagination: DealSearchDto) {
    // const myKeywords = await this.userKeywords(userId);
    const {
      q,
      endDate,
      startDate,
      shopId,
      shop,
      take,
      skip,
      onlyVideo,
      categoryId
    } = pagination;
  
    const query = Deal.createQueryBuilder('deal')
      .leftJoinAndSelect('deal.shop', 'shop')
      .leftJoinAndSelect('shop.owner', 'owner')
      // .addSelect(
      //   `ts_rank(to_tsvector(deal.keywords), to_tsquery('${myKeywords}'))`,
      //   'rank'
      // )
      .andWhere('COALESCE(deal.availableUntil > CURRENT_TIMESTAMP , true)')
  
    if (q?.length) query.andWhere('deal.title ~* :query ', { query: q });
  
    if (onlyVideo === 'true') {
      query.andWhere("deal.video IS NOT NULL OR deal.video <> ''");
    }
  
    if (shop) query.andWhere('shop.name  ~* :shop', { shop });
  
    if (shopId) query.andWhere('shop.id = :shopId', { shopId });

    if (categoryId) query.andWhere('shop.categoryId = :categoryId', { categoryId });
  
    if (startDate)
      query.andWhere(
        'COALESCE(deal.availableUntil, deal.createdAt) >= :startDate',
        { startDate: startDate.toDateString() }
      );
  
    if (endDate)
      query.andWhere(
        'COALESCE(deal.availableUntil, deal.createdAt) <= :endDate',
        { endDate: endDate.toDateString() }
      );
  
    query.take(take).skip(skip);
    // query.orderBy('rank', 'DESC');
    query.addOrderBy('deal.updateAt', 'DESC');
  
    const deals = await query.getMany();

    return deals;
  }
  

  // async userKeywords(userId?: string): Promise<string> {
  //   const query = await UserAnalytics.createQueryBuilder('userAnalytics')
  //     .innerJoin('userAnalytics.deal', 'deal')
  //     .select('deal.keywords', 'keywords')
  //     .andWhere("userAnalytics.type != 'view'")
  //     .orderBy('userAnalytics.createdAt', 'DESC')
  //     .limit(10);

  //   if (userId) query.andWhere('userAnalytics.userId = :userId', { userId });

  //   const data = await query.getRawMany();

  //   return data
  //     .flatMap((item) => (item.keywords as string)?.split(',').slice(0, 5))
  //     .filter((e) => !!e.trim())
  //     .join('|')
  //     .replace(/ /g, '');
  // }

  findOne(number: number) {
    return Deal.findOne({
      where: { id: number },
      relations: ['shop',  ],
      withDeleted: true,
    });
  }

  async remove(number: number) {
    const deal = await Deal.findOne({ where: { id: number } });
    return deal.softRemove();
  }

  async getDealsByShop(shopId: number , query:AdminDealSearchDto): Promise<any> {

    const {q ,take , skip , expired , deleted} = query;

    const queryBuilder = Deal.createQueryBuilder('deal')
      .leftJoinAndSelect('deal.shop', 'shop')
      .leftJoinAndSelect('shop.owner', 'owner')
      .where('shop.id = :shopId', { shopId });

    if (q?.length) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('deal.title ~* :query ', { query: q })
            .orWhere('deal.keywords ~* :query ', { query: q })
        }),
      );
    }

    if (expired === 'false')
      queryBuilder.andWhere(
        'COALESCE(deal.availableUntil > CURRENT_TIMESTAMP, true)',
      );

    if (expired === 'true')
      queryBuilder.andWhere(
        'COALESCE(deal.availableUntil <= CURRENT_TIMESTAMP, true)',
      );

    if (deleted === 'true') queryBuilder.andWhere('deal.deletedAt IS NOT NULL');
    else queryBuilder.andWhere('deal.deletedAt IS NULL');
    
    queryBuilder.withDeleted();
    queryBuilder.take(take).skip(skip);
    queryBuilder.orderBy('deal.updateAt', 'DESC');
    const deals = await queryBuilder.getMany();

    return deals;
  }
}
