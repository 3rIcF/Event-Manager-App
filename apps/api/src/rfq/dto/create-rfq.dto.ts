import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RfqStatus } from '@elementaro/types';

export class CreateRfqDto {
  @ApiProperty({
    description: 'Titel der RFQ',
    example: 'Elektrische Komponenten für Sommerfest',
    minLength: 1,
  })
  @IsString({ message: 'Titel muss ein String sein' })
  @IsNotEmpty({ message: 'Titel ist erforderlich' })
  title: string;

  @ApiProperty({
    description: 'Detaillierte Beschreibung der RFQ',
    example: 'Benötige elektrische Komponenten für das Sommerfest 2024',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Beschreibung muss ein String sein' })
  description?: string;

  @ApiProperty({
    description: 'ID des zugehörigen Projekts',
    example: 'proj_123',
  })
  @IsUUID('4', { message: 'Projekt-ID muss eine gültige UUID sein' })
  @IsNotEmpty({ message: 'Projekt-ID ist erforderlich' })
  projectId: string;

  @ApiProperty({
    description: 'Frist für Angebote',
    example: '2024-05-15T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Frist muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Frist ist erforderlich' })
  dueDate: string;

  @ApiProperty({
    description: 'Status der RFQ',
    enum: RfqStatus,
    example: RfqStatus.DRAFT,
    default: RfqStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(RfqStatus, { message: 'Ungültiger RFQ-Status' })
  status?: RfqStatus;

  @ApiProperty({
    description: 'IDs der Lieferanten, die die RFQ erhalten sollen',
    example: ['supplier_1', 'supplier_2'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Lieferanten-IDs müssen ein Array sein' })
  @IsUUID('4', { each: true, message: 'Jede Lieferanten-ID muss eine gültige UUID sein' })
  supplierIds?: string[];
}
