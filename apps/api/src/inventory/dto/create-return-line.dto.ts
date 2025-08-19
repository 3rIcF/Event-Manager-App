import { IsString, IsOptional, IsUUID, IsNumber, IsFloat, Min } from 'class-validator';

export class CreateReturnLineDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  materialId: string;

  @IsFloat()
  @Min(0.01)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
