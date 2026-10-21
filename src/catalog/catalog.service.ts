import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

@Injectable()
export class CatalogService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateCatalogItemDto) {
		return this.prisma.catalogItem.create({ data: dto });
	}

	findAll() {
		return this.prisma.catalogItem.findMany({
			orderBy: [{ id: 'asc' }],
		});
	}

	findOne(id: number) {
		return this.prisma.catalogItem.findUnique({ where: { id } });
	}

	update(id: number, dto: UpdateCatalogItemDto) {
		return this.prisma.catalogItem.update({
			where: { id },
			data: dto,
		});
	}

	remove(id: number) {
		return this.prisma.catalogItem.delete({ where: { id } });
	}
}
