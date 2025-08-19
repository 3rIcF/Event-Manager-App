import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsArray } from 'class-validator';

export class CreateGlobalMaterialDto {
  @ApiProperty({
    example: 'Bauzaun Element 3,5m',
    description: 'Material name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Absperrung',
    description: 'Material category',
  })
  @IsString()
  category: string;

  @ApiProperty({
    example: 'Stk',
    description: 'Unit of measurement',
  })
  @IsString()
  unit: string;

  @ApiProperty({
    example: 'Standard Bauzaun, feuerverzinkt, 3,5m x 2m',
    description: 'Material specifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  specs?: string;

  @ApiProperty({
    example: ['basic', 'outdoor'],
    description: 'Material portfolio categories',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolio?: string[];

  @ApiProperty({
    example: 2,
    description: 'Standard lead time in days',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardLeadTime?: number;
}

export class CreateProjectMaterialDto {
  @ApiProperty({
    example: 'mat_001',
    description: 'Global material ID',
  })
  @IsString()
  globalMaterialId: string;

  @ApiProperty({
    example: 150,
    description: 'Quantity needed',
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: 'SETUP',
    enum: ['SETUP', 'SHOW', 'TEARDOWN'],
    description: 'Material phase',
  })
  @IsString()
  phase: 'SETUP' | 'SHOW' | 'TEARDOWN';

  @ApiProperty({
    example: 'Perimeter Süd',
    description: 'Material location',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: '2025-09-15T08:00:00.000Z',
    description: 'Delivery time',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @ApiProperty({
    example: '2025-09-18T16:00:00.000Z',
    description: 'Pickup time',
    required: false,
  })
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @ApiProperty({
    example: ['stapler', 'crew_2'],
    description: 'Material needs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  needs?: string[];

  @ApiProperty({
    example: 99.99,
    description: 'Special price for this project',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  specialPrice?: number;

  @ApiProperty({
    example: 'Boden ist sehr weich - extra Füße bestellen',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}