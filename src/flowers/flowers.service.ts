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

	async findAllWithFilters() {
		const [items, colors, priceRange, categories] = await Promise.all([
			this.prisma.flower.findMany({
				include: {
					category: {
						select: { id: true, name: true },
					},
				},
				orderBy: [{ id: 'asc' }],
			}),
			this.prisma.flower.groupBy({
				by: ['color'],
				_count: { _all: true },
				orderBy: { color: 'asc' },
			}),
			this.prisma.flower.aggregate({
				_min: { price: true },
				_max: { price: true },
			}),
			this.prisma.category.findMany({
				where: { flowers: { some: {} } },
				select: {
					id: true,
					name: true,
					_count: { select: { flowers: true } },
				},
				orderBy: { name: 'asc' },
			}),
		]);

		return {
			items,
			filters: {
				colors: colors.map(({ color, _count }) => ({
					value: color,
					count: _count._all,
				})),
				prices: [priceRange._min.price, priceRange._max.price],
				categories: categories.map(({ id, name, _count }) => ({
					id,
					name,
					count: _count.flowers,
				})),
			},
		};
	}

	findCategories() {
		return this.prisma.category.findMany({
			orderBy: { name: 'asc' },
		});
	}

	create(dto: CreateFlowersDto) {
		return this.prisma.$transaction(async (tx) => {
			const { category, ...flowerData } = dto;
			const categoryRecord = category
				? await tx.category.upsert({
						where: { name: category },
						update: {},
						create: { name: category },
					})
				: undefined;

			return tx.flower.create({
				data: {
					...flowerData,
					...(categoryRecord && {
						category: { connect: { id: categoryRecord.id } },
					}),
					item: {
						create: {
							name: dto.name,
							price: dto.price,
							type: 'FLOWER',
						},
					},
				},
			});
		});
	}

	update(dto: UpdateFlowersDto, id: number) {
		const { name, price, category, ...flowerData } = dto;
		const data = {
			...flowerData,
			...(category && {
				category: {
					connectOrCreate: {
						where: { name: category },
						create: { name: category },
					},
				},
			}),
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
