import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	private async buildOrderItems(
		tx: Prisma.TransactionClient,
		items: CreateOrderDto['items'],
	) {
		const itemIds = [...new Set(items.map(({ itemId }) => itemId))];
		const catalogItems = await tx.catalogItem.findMany({
			where: { id: { in: itemIds } },
			select: { id: true, price: true },
		});
		const catalogItemsById = new Map(
			catalogItems.map((item) => [item.id, item]),
		);
		const missingItemIds = itemIds.filter(
			(itemId) => !catalogItemsById.has(itemId),
		);

		if (missingItemIds.length > 0) {
			throw new NotFoundException(
				`Catalog items not found: ${missingItemIds.join(', ')}`,
			);
		}

		return items.map(({ itemId, quantity }) => ({
			quantity,
			unitPrice: catalogItemsById.get(itemId).price,
			item: { connect: { id: itemId } },
		}));
	}

	create(createOrderDto: CreateOrderDto) {
		const { userId, items, ...orderData } = createOrderDto;

		return this.prisma.$transaction(async (tx) => {
			const orderItems = await this.buildOrderItems(tx, items);

			return tx.order.create({
				data: {
					...orderData,
					...(userId && { user: { connect: { id: userId } } }),
					items: { create: orderItems },
				},
			});
		});
	}

	findAll() {
		return this.prisma.order.findMany({
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						type: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				items: {
					include: {
						item: true,
					},
				},
			},
			orderBy: [{ id: 'asc' }],
		});
	}

	findOne(id: number) {
		return this.prisma.order.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						type: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				items: {
					include: {
						item: true,
					},
				},
			},
		});
	}

	update(id: number, updateOrderDto: UpdateOrderDto) {
		const { userId, items, ...orderData } = updateOrderDto;

		return this.prisma.$transaction(async (tx) => {
			const orderItems =
				items !== undefined
					? await this.buildOrderItems(tx, items)
					: undefined;

			return tx.order.update({
				where: { id },
				data: {
					...orderData,
					...(userId !== undefined &&
						(userId
							? { user: { connect: { id: userId } } }
							: { user: { disconnect: true } })),
					...(orderItems !== undefined && {
						items: {
							deleteMany: {},
							create: orderItems,
						},
					}),
				},
			});
		});
	}

	remove(id: number) {
		return this.prisma.order.delete({ where: { id } });
	}
}
