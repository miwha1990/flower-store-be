import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFlowersDto } from './dto/create-flowers.dto';
import { UpdateFlowersDto } from './dto/update-flowers.dto';

@Injectable()
export class FlowersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.flower.findMany({
      orderBy: [{ id: 'asc' }],
    });
  }

  create(dto: CreateFlowersDto) {
    return this.prisma.flower.create({
      data: dto,
    });
  }
  update(dto: UpdateFlowersDto, id: number) {
    return this.prisma.flower.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.flower.delete({ where: { id } });
  }
}
