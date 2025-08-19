import { IsString, IsOptional, IsUUID, IsNumber, IsInt, Min } from 'class-validator';

export class CreateInventorySkuDto {
  @IsString()
  sku: string;

  @IsUUID()
  materialId: string;

  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxQuantity?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
