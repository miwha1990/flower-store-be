import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsInt,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import type { CatalogItem } from '../../catalog/entities/catalog-item.entity';

export class CreateOrderItemDto {
	@Type(() => Number)
	@IsInt()
	itemId: CatalogItem['id'];

	@Type(() => Number)
	@IsInt()
	quantity: number;
}

export class CreateOrderDto {
	@IsOptional()
	@IsString()
	userId?: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateOrderItemDto)
	items: CreateOrderItemDto[];

	@IsString()
	status: string;

	@IsString()
	details: string;
}
