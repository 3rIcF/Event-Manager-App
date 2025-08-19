import { PartialType } from '@nestjs/mapped-types';
import { CreateInventorySkuDto } from './create-inventory-sku.dto';

export class UpdateInventorySkuDto extends PartialType(CreateInventorySkuDto) {}
