import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DealsRedeemService } from './deals-redeem.service';
import { CreateDealsRedeemDto } from './dto/create-deals-redeem.dto';
import { UpdateDealsRedeemDto } from './dto/update-deals-redeem.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { FUser } from '../user/decorator/firebase.user.decorator';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import { Pagination } from 'src/common/dtos/pagination.dto';
import { CloseDealsRedeemDto } from './dto/close-redeem.dto';

@Controller('deals-redeem')
@ApiTags('deals-redeem')
@FirebaseSecure()
@ApiBearerAuth()
export class DealsRedeemController {
  constructor(private readonly dealsRedeemService: DealsRedeemService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createDealsRedeemDto: CreateDealsRedeemDto,
    @FUser() user: FirebaseUser,
  ) {
    return this.dealsRedeemService.create(createDealsRedeemDto, user.uid);
  }

  @Get('user')
  findAllByUser(
    @FUser() user: FirebaseUser,
    @Query() paginationDto: Pagination,
  ) {
    return this.dealsRedeemService.findAllByUser(user.uid, paginationDto);
  }

  @Get()
  findAll() {
    return this.dealsRedeemService.findAll();
  }

  @Get('shop')
  findAllByShop(
    @FUser() user: FirebaseUser,
    @Query() paginationDto: Pagination,
  ) {
    return this.dealsRedeemService.findAllByShop(user.uid, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsRedeemService.findOne(+id);
  }

  @Patch(':id')
  // @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateDealsRedeemDto: UpdateDealsRedeemDto,
    @FUser() user: FirebaseUser,
  ) {
    return this.dealsRedeemService.update(+id, updateDealsRedeemDto, user.uid);
  }

  @Patch('approve/:id')
  approve(@Param('id') id: string, @Body() closeDealsRedeemBodyDto: CloseDealsRedeemDto, @FUser() user: FirebaseUser) {
    return this.dealsRedeemService.approve(+id, user.uid, closeDealsRedeemBodyDto);
  }

  @Patch('use/:couponcode')
  use(@Param('couponcode') couponcode: string, @FUser() user: FirebaseUser) { 
    return this.dealsRedeemService.use(couponcode, user.uid);
  }
  


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealsRedeemService.remove(+id);
  }

  
}
