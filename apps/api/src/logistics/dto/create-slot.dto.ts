import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty({
    description: 'ID des zugehörigen Projekts',
    example: 'proj_123',
  })
  @IsString({ message: 'Projekt-ID muss ein String sein' })
  @IsNotEmpty({ message: 'Projekt-ID ist erforderlich' })
  projectId: string;

  @ApiProperty({
    description: 'Tor oder Eingang für das Zeitfenster',
    example: 'Tor A',
    minLength: 1,
  })
  @IsString({ message: 'Tor muss ein String sein' })
  @IsNotEmpty({ message: 'Tor ist erforderlich' })
  gate: string;

  @ApiProperty({
    description: 'Startzeit des Zeitfensters',
    example: '2024-06-15T08:00:00.000Z',
  })
  @IsDateString({}, { message: 'Startzeit muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Startzeit ist erforderlich' })
  from: string;

  @ApiProperty({
    description: 'Endzeit des Zeitfensters',
    example: '2024-06-15T10:00:00.000Z',
  })
  @IsDateString({}, { message: 'Endzeit muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Endzeit ist erforderlich' })
  to: string;

  @ApiProperty({
    description: 'Typ des Zeitfensters',
    example: 'DELIVERY',
    enum: ['DELIVERY', 'PICKUP', 'SERVICE', 'SETUP', 'CLEANUP'],
    default: 'DELIVERY',
  })
  @IsOptional()
  @IsString({ message: 'Typ muss ein String sein' })
  @IsIn(['DELIVERY', 'PICKUP', 'SERVICE', 'SETUP', 'CLEANUP'], {
    message: 'Typ muss einer der folgenden Werte sein: DELIVERY, PICKUP, SERVICE, SETUP, CLEANUP'
  })
  type?: string;

  @ApiProperty({
    description: 'Maximale Anzahl von Lieferanten für dieses Zeitfenster',
    example: 3,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximale Lieferantenanzahl muss eine Zahl sein' })
  @Min(1, { message: 'Maximale Lieferantenanzahl muss mindestens 1 sein' })
  maxSuppliers?: number;

  @ApiProperty({
    description: 'Zusätzliche Notizen zum Zeitfenster',
    example: 'Nur für schwere Lasten geeignet',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notizen müssen ein String sein' })
  notes?: string;
}
