import { IsString, IsOptional, IsUUID, IsNumber, IsInt, Min } from 'class-validator';

export class CreateKanbanTaskDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  columnId: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON as string
}
