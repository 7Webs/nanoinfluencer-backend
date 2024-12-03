import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DealsRedeemService } from './deals-redeem.service';
import { CreateDealsRedeemDto } from './dto/create-deals-redeem.dto';
import { UpdateDealsRedeemDto } from './dto/update-deals-redeem.dto';

@Controller('deals-redeem')
export class DealsRedeemController {
  constructor(private readonly dealsRedeemService: DealsRedeemService) {}

  @Post()
  create(@Body() createDealsRedeemDto: CreateDealsRedeemDto) {
    return this.dealsRedeemService.create(createDealsRedeemDto);
  }

  @Get()
  findAll() {
    return this.dealsRedeemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsRedeemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDealsRedeemDto: UpdateDealsRedeemDto) {
    return this.dealsRedeemService.update(+id, updateDealsRedeemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealsRedeemService.remove(+id);
  }
}
