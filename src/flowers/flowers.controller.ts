import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FlowersService } from './flowers.service';
import { LogginInterceptor } from '../conception/interceptor';
import { CreateFlowersDto } from './dto/create-flowers.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UploadService } from 'src/upload/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateFlowersDto } from './dto/update-flowers.dto';

@Controller('flowers')
// @UseInterceptors(LogginInterceptor)
export class FlowersController {
  constructor(
    private readonly flowersService: FlowersService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  findAll() {
    return this.flowersService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1000000 }),
        ],
        fileIsRequired: false
      }),
    )
    file: Express.Multer.File,
    @Body() dto: CreateFlowersDto,
  ) {
    if (file) {
      dto.imageSrc = await this.uploadService.upload(
        file.originalname,
        file.buffer,
      );
    }
    if (dto.price) {
      dto.price = Number(dto.price);
    }
    if (dto.amount) {
      dto.amount = Number(dto.amount);
    }
    return this.flowersService.create(dto);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1000000 }),
        ],
        fileIsRequired: false
      }),
    )
    file: Express.Multer.File,
    @Body() dto: CreateFlowersDto,
  ) {
    if (file) {
      dto.imageSrc = await this.uploadService.upload(
        file.originalname,
        file.buffer,
      );
    }
    if (dto.price) {
      dto.price = Number(dto.price);
    }
    if (dto.amount) {
      dto.amount = Number(dto.amount);
    }
    return this.flowersService.update(dto, +id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.flowersService.remove(Number(id));
  }
}
