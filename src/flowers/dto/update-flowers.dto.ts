import { PartialType } from "@nestjs/mapped-types";
import { CreateFlowersDto } from "./create-flowers.dto";

export class UpdateFlowersDto extends PartialType(CreateFlowersDto) {}

export type TUpdateFlowersDto = Partial<UpdateFlowersDto>;


