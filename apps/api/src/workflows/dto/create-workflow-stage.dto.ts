import { IsString, IsOptional, IsUUID, IsNumber, IsEnum } from 'class-validator';

export class CreateWorkflowStageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  workflowId: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'COMPLETED'])
  status?: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON as string
}
