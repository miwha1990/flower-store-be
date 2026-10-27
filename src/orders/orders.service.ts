import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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
			select: {
				id: true,
				price: true,
				flower: { select: { id: true } },
			},
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

		const requestedFlowerQuantities = new Map<number, number>();
		const orderItems = items.map(({ itemId, quantity }) => {
			const catalogItem = catalogItemsById.get(itemId);

			if (catalogItem.flower) {
				const flowerId = catalogItem.flower.id;
				requestedFlowerQuantities.set(
					flowerId,
					(requestedFlowerQuantities.get(flowerId) ?? 0) + quantity,
				);
			}

			return {
				quantity,
				unitPrice: catalogItem.price,
				item: { connect: { id: itemId } },
			};
		});

		return { orderItems, requestedFlowerQuantities };
	}

	private async adjustFlowerStock(
		tx: Prisma.TransactionClient,
		quantityChanges: Map<number, number>,
	) {
		for (const [flowerId, change] of quantityChanges) {
			if (change > 0) {
				const result = await tx.flower.updateMany({
					where: { id: flowerId, amount: { gte: change } },
					data: { amount: { decrement: change } },
				});

				if (result.count !== 1) {
					throw new ConflictException(
						`Insufficient stock for flower ${flowerId}`,
					);
				}
			} else if (change < 0) {
				const result = await tx.flower.updateMany({
					where: { id: flowerId },
					data: { amount: { increment: -change } },
				});

				if (result.count !== 1) {
					throw new NotFoundException(`Flower ${flowerId} not found`);
				}
			}
		}
	}

	create(createOrderDto: CreateOrderDto) {
		const { userId, items, ...orderData } = createOrderDto;

		return this.prisma.$transaction(async (tx) => {
			const { orderItems, requestedFlowerQuantities } =
				await this.buildOrderItems(tx, items);
			await this.adjustFlowerStock(tx, requestedFlowerQuantities);

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
			const orderItemData =
				items !== undefined
					? await this.buildOrderItems(tx, items)
					: undefined;

			if (orderItemData) {
				const existingOrder = await tx.order.findUnique({
					where: { id },
					select: {
						items: {
							select: {
								quantity: true,
								item: {
									select: {
										flower: { select: { id: true } },
									},
								},
							},
						},
					},
				});

				if (!existingOrder) {
					throw new NotFoundException(`Order ${id} not found`);
				}

				const previousFlowerQuantities = new Map<number, number>();
				for (const orderItem of existingOrder.items) {
					const flowerId = orderItem.item.flower?.id;
					if (flowerId !== undefined) {
						previousFlowerQuantities.set(
							flowerId,
							(previousFlowerQuantities.get(flowerId) ?? 0) +
								orderItem.quantity,
						);
					}
				}

				const stockChanges = new Map<number, number>();
				for (const [
					flowerId,
					quantity,
				] of orderItemData.requestedFlowerQuantities) {
					stockChanges.set(flowerId, quantity);
				}
				for (const [flowerId, quantity] of previousFlowerQuantities) {
					stockChanges.set(
						flowerId,
						(stockChanges.get(flowerId) ?? 0) - quantity,
					);
				}

				await this.adjustFlowerStock(tx, stockChanges);
			}

			return tx.order.update({
				where: { id },
				data: {
					...orderData,
					...(userId !== undefined &&
						(userId
							? { user: { connect: { id: userId } } }
							: { user: { disconnect: true } })),
					...(orderItemData !== undefined && {
						items: {
							deleteMany: {},
							create: orderItemData.orderItems,
						},
					}),
				},
			});
		});
	}

	remove(id: number) {
		return this.prisma.$transaction(async (tx) => {
			const order = await tx.order.findUnique({
				where: { id },
				select: {
					items: {
						select: {
							quantity: true,
							item: {
								select: {
									flower: { select: { id: true } },
								},
							},
						},
					},
				},
			});

			if (!order) {
				throw new NotFoundException(`Order ${id} not found`);
			}

			const stockChanges = new Map<number, number>();
			for (const orderItem of order.items) {
				const flowerId = orderItem.item.flower?.id;
				if (flowerId !== undefined) {
					stockChanges.set(
						flowerId,
						(stockChanges.get(flowerId) ?? 0) - orderItem.quantity,
					);
				}
			}

			await this.adjustFlowerStock(tx, stockChanges);
			return tx.order.delete({ where: { id } });
		});
	}
}
