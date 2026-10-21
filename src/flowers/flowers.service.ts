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
      data: {
        ...dto,
        item: {
          create: {
            name: dto.name,
            price: dto.price,
            type: 'FLOWER',
          },
        },
      },
    });
  }

  update(dto: UpdateFlowersDto, id: number) {
    const { name, price, ...flowerData } = dto;
    const data = {
      ...flowerData,
      ...(name !== undefined || price !== undefined
        ? {
            item: {
              update: {
                ...(name !== undefined && { name }),
                ...(price !== undefined && { price }),
              },
            },
          }
        : {}),
    };

    return this.prisma.flower.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.flower.delete({ where: { id } });
  }
}
