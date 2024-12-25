import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { UploaderModule } from '../../providers/uploader/uploader.module';

@Module({
  imports: [
    UploaderModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealsModule {}
