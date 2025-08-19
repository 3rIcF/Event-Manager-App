import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovePermitDto {
  @ApiProperty({
    description: 'Bedingungen für die Genehmigung',
    example: ['Temporäre Bühne muss nach dem Event entfernt werden', 'Maximale Höhe: 3 Meter'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Bedingungen müssen ein Array sein' })
  @IsString({ each: true, message: 'Jede Bedingung muss ein String sein' })
  conditions?: string[];
}
