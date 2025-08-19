import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Typ des Dokuments',
    example: 'Bauplan',
    minLength: 1,
  })
  @IsString({ message: 'Dokumenttyp muss ein String sein' })
  @IsNotEmpty({ message: 'Dokumenttyp ist erforderlich' })
  docType: string;

  @ApiProperty({
    description: 'Zusätzliche Notizen zum Dokument',
    example: 'Grundriss der temporären Bühne',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notizen müssen ein String sein' })
  notes?: string;
}
