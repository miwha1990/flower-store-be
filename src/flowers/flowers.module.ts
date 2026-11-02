import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadModule } from 'src/upload/upload.module';
import { UploadService } from 'src/upload/upload.service';
import { PrismaService } from '../prisma.service';
import { FlowersController } from './flowers.controller';
import { FlowersService } from './flowers.service';

@Module({
	controllers: [FlowersController],
	providers: [FlowersService, PrismaService, ConfigService, UploadService],
	imports: [UploadModule],
})
export class FlowersModule {}
