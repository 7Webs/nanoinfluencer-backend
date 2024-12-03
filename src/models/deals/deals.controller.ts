import {
  Controller,
  Get,
  Request,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  Query,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DealSearchDto } from './dto/deal.search.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { FirebaseUser } from '../../providers/firebase/firebase.service';
import { AdminDealSearchDto } from './dto/AdminSearchDeal.dto';
import { Pagination } from 'src/common/dtos/pagination.dto';
import { Public } from '../user/decorator/public.decorator';

@Controller('deals')
@ApiTags('deals')
@FirebaseSecure()
@ApiBearerAuth()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('my-deals')
  @ApiOperation({ summary: 'Get my deals' })
  @ApiResponse({ status: 200, description: 'Deals retrieved successfully' })
  myDeals(
    @Request() req,
    @Query() pagination: Pagination,
    @FUser() user: FirebaseUser,
  ) {
    return this.dealsService.myShopDeals(user.uid, pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create deal' })
  @ApiBody({ type: CreateDealDto, description: 'Create deal' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFiles', maxCount: 10 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createDealDto: CreateDealDto,
    @FUser() user: FirebaseUser,
    @UploadedFiles()
    files: { imageFiles: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    return this.dealsService.create(
      user.uid,
      createDealDto,
      files.imageFiles,
      files.video?.[0],
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal' })
  @ApiBody({ type: UpdateDealDto, description: 'Update deal' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageFiles', maxCount: 10 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: number,
    @Body() updateDealDto: UpdateDealDto,
    @Request() req,
    @FUser() user: FirebaseUser,
    @UploadedFiles()
    {
      imageFiles,
      video,
    }: {
      imageFiles: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    return this.dealsService.update(
      user.uid,
      id,
      updateDealDto,
      imageFiles,
      video?.[0],
    );
  }

  @Public()
  @Get('top-deals')
  @ApiOperation({ summary: 'Get top deals' })
  @ApiResponse({ status: 200, description: 'Deals retrieved successfully' })
  topDeals(@Query() pagination: DealSearchDto, @FUser() user: FirebaseUser) {
    return this.dealsService.topDeals(user?.uid, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal' })
  @ApiResponse({ status: 200, description: 'Deal retrieved successfully' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  findOne(@Param('id') id: number) {
    return this.dealsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete deal' })
  @ApiResponse({ status: 200, description: 'Deal deleted successfully' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'Deal not found' })
  remove(@Param('id') id: number) {
    return this.dealsService.remove(id);
  }

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get deals by shop' })
  @ApiParam({ name: 'shopId', type: Number })
  async getDealsByShop(
    @Param('shopId') shopId: number,
    @Query() query: AdminDealSearchDto,
  ): Promise<any> {
    return this.dealsService.getDealsByShop(shopId, query);
  }
}
