import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermitStatus } from '@elementaro/types';

export class CreatePermitDto {
  @ApiProperty({
    description: 'Typ der Genehmigung',
    example: 'Baugenehmigung',
    minLength: 1,
  })
  @IsString({ message: 'Typ muss ein String sein' })
  @IsNotEmpty({ message: 'Typ ist erforderlich' })
  type: string;

  @ApiProperty({
    description: 'Zuständige Behörde',
    example: 'Stadt München - Bauamt',
    minLength: 1,
  })
  @IsString({ message: 'Behörde muss ein String sein' })
  @IsNotEmpty({ message: 'Behörde ist erforderlich' })
  authority: string;

  @ApiProperty({
    description: 'ID des zugehörigen Projekts',
    example: 'proj_123',
  })
  @IsUUID('4', { message: 'Projekt-ID muss eine gültige UUID sein' })
  @IsNotEmpty({ message: 'Projekt-ID ist erforderlich' })
  projectId: string;

  @ApiProperty({
    description: 'Gültigkeitsbeginn der Genehmigung',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Gültigkeitsbeginn muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Gültigkeitsbeginn ist erforderlich' })
  validFrom: string;

  @ApiProperty({
    description: 'Gültigkeitsende der Genehmigung',
    example: '2024-06-30T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'Gültigkeitsende muss ein gültiges Datum sein' })
  @IsNotEmpty({ message: 'Gültigkeitsende ist erforderlich' })
  validTo: string;

  @ApiProperty({
    description: 'Status der Genehmigung',
    enum: PermitStatus,
    example: PermitStatus.PENDING,
    default: PermitStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PermitStatus, { message: 'Ungültiger Genehmigungsstatus' })
  status?: PermitStatus;

  @ApiProperty({
    description: 'Zusätzliche Notizen zur Genehmigung',
    example: 'Genehmigung für temporäre Bühne im Stadtpark',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notizen müssen ein String sein' })
  notes?: string;
}
