import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { FirebaseSecure } from '../user/decorator/firebase.secure.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('Rewards')
@Controller('rewards')
@FirebaseSecure()
@ApiBearerAuth()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new reward (Admin only)' })
  create(@Body() createRewardDto: CreateRewardDto, @UploadedFiles() files: { image: Express.Multer.File[];}) {
    return this.rewardsService.create(createRewardDto, files.image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rewards' })
  findAll() {
    return this.rewardsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active rewards' })
  findAllActive() {
    return this.rewardsService.findAllActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific reward by ID' })
  findOne(@Param('id') id: string) {
    return this.rewardsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a reward (Admin only)' })
  update(@Param('id') id: string, @Body() updateRewardDto: UpdateRewardDto) {
    return this.rewardsService.update(+id, updateRewardDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle reward active status (Admin only)' })
  toggleActive(@Param('id') id: string) {
    return this.rewardsService.toggleActive(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reward (Admin only)' })
  remove(@Param('id') id: string) {
    return this.rewardsService.remove(+id);
  }
}