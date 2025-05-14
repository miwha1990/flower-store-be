import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly region: string;
  private readonly bucket: string;
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow('AWS_S3_REGION');
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
    this.s3Client = new S3Client({
        region: this.region,
      });
  }

  async upload(fileName: string, file: Buffer) {
    return await this.s3Client
      .send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `images/${fileName}`,
          Body: file,
          ACL: 'public-read',
        }),
      )
      .then(() => {
        return `https://${this.bucket}.s3.${this.region}.amazonaws.com/images/${fileName}`;
      });
  }
}
