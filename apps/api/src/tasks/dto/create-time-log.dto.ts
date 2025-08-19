import { IsString, IsOptional, IsDateString, IsUUID, IsNumber } from 'class-validator';

export class CreateTimeLogDto {
  @IsUUID()
  taskId: string;

  @IsDateString()
  date: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  duration?: number; // Duration in milliseconds

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  activity?: string; // Type of activity performed
}
