import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          limit: configService.getOrThrow('UPLOAD_RATE_TTL'),
          ttl: configService.getOrThrow('UPLOAD_RATE_LIMIT'),
        }],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadModule, UploadService]
})
export class UploadModule {}
