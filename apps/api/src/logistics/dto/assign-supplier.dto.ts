import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSupplierDto {
  @ApiProperty({
    description: 'ID des Lieferanten',
    example: 'supplier_123',
  })
  @IsUUID('4', { message: 'Lieferanten-ID muss eine gültige UUID sein' })
  @IsNotEmpty({ message: 'Lieferanten-ID ist erforderlich' })
  supplierId: string;
}
