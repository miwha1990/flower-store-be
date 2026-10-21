import { ItemType } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateCatalogItemDto {
	@IsEnum(ItemType)
	type: ItemType;

	@IsString()
	name: string;

	@IsNumber()
	price: number;
}
