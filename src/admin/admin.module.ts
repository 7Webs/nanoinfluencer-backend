import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EmailModule } from 'src/providers/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
