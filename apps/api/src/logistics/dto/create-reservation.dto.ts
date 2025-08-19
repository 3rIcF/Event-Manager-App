import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID des zugehörigen Projekts',
    example: 'proj_123',
  })
  @IsUUID('4', { message: 'Projekt-ID muss eine gültige UUID sein' })
  @IsNotEmpty({ message: 'Projekt-ID ist erforderlich' })
  projectId: string;

  @ApiProperty({
    description: 'ID des reservierten Materials oder Equipments',
    example: 'material_123',
  })
  @IsString({ message: 'Material-ID muss ein String sein' })
  @IsNotEmpty({ message: 'Material-ID ist erforderlich' })
  materialId: string;

  @ApiProperty({
    description: 'Startzeit der Reservierung',
    example: '2024-06-15T08:00:00.000Z',
  })
  @IsDateString({}, { message: 'Startzeit muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Startzeit ist erforderlich' })
  from: string;

  @ApiProperty({
    description: 'Endzeit der Reservierung',
    example: '2024-06-15T18:00:00.000Z',
  })
  @IsDateString({}, { message: 'Endzeit muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Endzeit ist erforderlich' })
  to: string;

  @ApiProperty({
    description: 'Anzahl der reservierten Einheiten',
    example: 5,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Anzahl muss eine Zahl sein' })
  @Min(1, { message: 'Anzahl muss mindestens 1 sein' })
  quantity?: number;

  @ApiProperty({
    description: 'Zusätzliche Notizen zur Reservierung',
    example: 'Für Bühnenaufbau benötigt',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notizen müssen ein String sein' })
  notes?: string;
}
