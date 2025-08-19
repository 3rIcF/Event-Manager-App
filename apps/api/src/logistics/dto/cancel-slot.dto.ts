import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelSlotDto {
  @ApiProperty({
    description: 'Grund für die Stornierung des Zeitfensters',
    example: 'Wetterbedingungen erlauben keine Lieferung',
    minLength: 10,
  })
  @IsString({ message: 'Stornierungsgrund muss ein String sein' })
  @IsNotEmpty({ message: 'Stornierungsgrund ist erforderlich' })
  @MinLength(10, { message: 'Stornierungsgrund muss mindestens 10 Zeichen lang sein' })
  reason: string;
}
