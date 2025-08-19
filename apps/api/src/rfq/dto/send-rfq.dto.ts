import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendRfqDto {
  @ApiProperty({
    description: 'IDs der Lieferanten, die die RFQ erhalten sollen',
    example: ['supplier_1', 'supplier_2'],
    type: [String],
  })
  @IsArray({ message: 'Lieferanten-IDs müssen ein Array sein' })
  @IsUUID('4', { each: true, message: 'Jede Lieferanten-ID muss eine gültige UUID sein' })
  @IsNotEmpty({ message: 'Mindestens eine Lieferanten-ID ist erforderlich' })
  supplierIds: string[];
}
