import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, Min, IsIn } from 'class-validator';

const PROJECT_STATUSES = ['IDEA', 'PLANNING', 'APPROVAL', 'SETUP', 'LIVE', 'TEARDOWN', 'CLOSED'] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];

export class CreateProjectDto {
  @ApiProperty({
    example: 'Stadtfest München 2025',
    description: 'Project name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Jährliches Stadtfest mit Bühnen, Ständen und Fahrgeschäften',
    description: 'Project description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2025-09-15T00:00:00.000Z',
    description: 'Project start date',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-09-17T00:00:00.000Z',
    description: 'Project end date',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 'München Zentrum',
    description: 'Project location',
  })
  @IsString()
  location: string;

  @ApiProperty({
    enum: PROJECT_STATUSES,
    example: 'PLANNING',
    description: 'Project status',
    required: false,
  })
  @IsOptional()
  @IsIn(PROJECT_STATUSES)
  status?: ProjectStatus = 'IDEA';

  @ApiProperty({
    example: 250000,
    description: 'Project budget in euros',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiProperty({
    example: 'user-id-123',
    description: 'ID of the responsible user',
    required: false,
  })
  @IsOptional()
  @IsString()
  responsibleId?: string;
}