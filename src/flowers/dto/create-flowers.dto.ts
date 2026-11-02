import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFlowersDto {
	@IsString({
		message: 'Not A String!',
	})
	name: string;

	@IsString()
	color: string;

	@IsString()
	imageSrc?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsNumber()
	price: number;

	@IsNumber()
	amount: number;
}

export type TCreateFlowersDto = Partial<CreateFlowersDto>;
