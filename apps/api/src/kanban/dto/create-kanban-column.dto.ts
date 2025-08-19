import { IsString, IsOptional, IsUUID, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateKanbanColumnDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  boardId: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxTasks?: number;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON as string
}
