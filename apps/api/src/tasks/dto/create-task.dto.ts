import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  workflowId?: string;

  @IsOptional()
  @IsUUID()
  workflowStageId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  tags?: string; // JSON as string

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsNumber()
  actualHours?: number;
}
