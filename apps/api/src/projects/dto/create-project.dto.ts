import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, Min, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Name des Projekts',
    example: 'Sommerfest 2024',
    minLength: 1,
  })
  @IsString({ message: 'Projektname muss ein String sein' })
  @IsNotEmpty({ message: 'Projektname ist erforderlich' })
  name: string;

  @ApiProperty({
    description: 'Startdatum des Projekts',
    example: '2024-06-15T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Startdatum muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Startdatum ist erforderlich' })
  dateFrom: string;

  @ApiProperty({
    description: 'Enddatum des Projekts',
    example: '2024-06-16T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Enddatum muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Enddatum ist erforderlich' })
  dateTo: string;

  @ApiProperty({
    description: 'Name des Veranstaltungsorts',
    example: 'Stadtpark München',
    minLength: 1,
  })
  @IsString({ message: 'Standortname muss ein String sein' })
  @IsNotEmpty({ message: 'Standortname ist erforderlich' })
  locationName: string;

  @ApiProperty({
    description: 'Vollständige Adresse des Veranstaltungsorts',
    example: 'Maximilianstraße 1, 80539 München',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Adresse muss ein String sein' })
  address?: string;

  @ApiProperty({
    description: 'Breitengrad des Veranstaltungsorts',
    example: 48.1351,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Breitengrad muss eine Zahl sein' })
  @IsLatitude({ message: 'Breitengrad muss ein gültiger Wert zwischen -90 und 90 sein' })
  lat?: number;

  @ApiProperty({
    description: 'Längengrad des Veranstaltungsorts',
    example: 11.5820,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Längengrad muss eine Zahl sein' })
  @IsLongitude({ message: 'Längengrad muss ein gültiger Wert zwischen -180 und 180 sein' })
  lng?: number;

  @ApiProperty({
    description: 'Geschätztes Budget für das Projekt',
    example: 50000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Budget muss eine Zahl sein' })
  @Min(0, { message: 'Budget darf nicht negativ sein' })
  budgetEstimate?: number;
}
