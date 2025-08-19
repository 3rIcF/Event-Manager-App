import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON as string

  @IsOptional()
  @IsString()
  status?: string;
}
