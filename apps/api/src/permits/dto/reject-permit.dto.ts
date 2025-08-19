import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectPermitDto {
  @ApiProperty({
    description: 'Grund für die Ablehnung der Genehmigung',
    example: 'Unvollständige Unterlagen - Bitte reichen Sie alle erforderlichen Dokumente nach',
    minLength: 10,
  })
  @IsString({ message: 'Ablehnungsgrund muss ein String sein' })
  @IsNotEmpty({ message: 'Ablehnungsgrund ist erforderlich' })
  @MinLength(10, { message: 'Ablehnungsgrund muss mindestens 10 Zeichen lang sein' })
  reason: string;
}
