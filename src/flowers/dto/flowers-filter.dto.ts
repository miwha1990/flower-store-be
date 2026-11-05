import { Transform } from 'class-transformer';
import {
	IsArray,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class FlowersFilterDto {
	@IsOptional()
	@Transform(({ value }) =>
		value === undefined ? undefined : Array.isArray(value) ? value : [value],
	)
	@IsArray()
	@IsString({ each: true })
	color?: string[];

	@IsOptional()
	@Transform(({ value }) =>
		value === undefined ? undefined : Array.isArray(value) ? value : [value],
	)
	@IsArray()
	@IsString({ each: true })
	category?: string[];

	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === '' ? undefined : Number(value),
	)
	@IsNumber()
	minPrice?: number;

	@IsOptional()
	@Transform(({ value }) =>
		value === undefined || value === '' ? undefined : Number(value),
	)
	@IsNumber()
	maxPrice?: number;
}
