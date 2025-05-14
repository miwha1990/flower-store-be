import { Module } from '@nestjs/common';
import { FlowersService } from './flowers.service';
import { FlowersController } from './flowers.controller';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { UploadModule } from 'src/upload/upload.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [FlowersController],
  providers: [FlowersService, PrismaService, ConfigService, UploadService],
  imports: [UploadModule]
})
export class FlowersModule {}
