import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { UploaderService } from 'src/providers/uploader/uploader.service';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    private readonly uploader: UploaderService,
  ) {}

  async create(createRewardDto: CreateRewardDto, photos: Express.Multer.File[], ): Promise<Reward> {

    const imagesPaths = await this.uploader.uploadFiles(
      photos,
      `rewards/${Date.now()}`,
    );

    createRewardDto.image = imagesPaths[0];


    const reward = this.rewardRepository.create(createRewardDto);
    return await this.rewardRepository.save(reward);
  }

  async findAll(): Promise<Reward[]> {
    return await this.rewardRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllActive(): Promise<Reward[]> {
    return await this.rewardRepository.find({
      where: {
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
    });

    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }

    return reward;
  }

  async update(id: number, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.findOne(id);
    Object.assign(reward, updateRewardDto);
    return await this.rewardRepository.save(reward);
  }

  async remove(id: number): Promise<void> {
    const reward = await this.findOne(id);
    await this.rewardRepository.remove(reward);
  }

  async toggleActive(id: number): Promise<Reward> {
    const reward = await this.findOne(id);
    reward.isActive = !reward.isActive;
    return await this.rewardRepository.save(reward);
  }
}