import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersSearchDto } from './dto/search-users.dto';
import { FirebaseSecure } from 'src/models/user/decorator/firebase.secure.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FUser } from 'src/models/user/decorator/firebase.user.decorator';
import { FirebaseUser } from 'src/providers/firebase/firebase.service';
import { ShopSearchDto } from './dto/search-shops.dto';

@Controller('admin')
@FirebaseSecure()
@ApiBearerAuth()
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // @Post()
  // create(@Body() createAdminDto: CreateAdminDto) {
  //   return this.adminService.create(createAdminDto);
  // }

  @Get('users')
  findAllUsers(
    @Query() userSearchDto: UsersSearchDto,
    @FUser() user: FirebaseUser,
  ) {
    return this.adminService.findAllUsers(userSearchDto);
  }

  @Post('users/:id/approve')
  approveSingleUser(@Param('id') id: string, @FUser() user: FirebaseUser) {
    return this.adminService.approveSingleUser(id, user.uid);
  }

  @Post('users/:id/block')
  blockSingleUser(@Param('id') id: string, @FUser() user: FirebaseUser) {
    return this.adminService.blockSingleUser(id, user.uid);
  }

  @Get('shops')
  findAllShops(
    @Query() shopSearchDto: ShopSearchDto,
    @FUser() user: FirebaseUser,
  ) {
    return this.adminService.findAllShops(shopSearchDto);
  }

  @Post('shops/:id/approve')
  approveSingleShop(@Param('id') id: number, @FUser() user: FirebaseUser) {
    return this.adminService.approveSingleShop(+id, user.uid);
  }

  @Post('shops/:id/block')
  blockSingleShop(@Param('id') id: number, @FUser() user: FirebaseUser) {
    return this.adminService.blockSingleShop(+id, user.uid);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.adminService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminService.update(+id, updateAdminDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.adminService.remove(+id);
  // }
}
