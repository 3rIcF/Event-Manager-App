import { PartialType } from '@nestjs/swagger';
import { CreateGlobalMaterialDto, CreateProjectMaterialDto } from './create-material.dto';

export class UpdateGlobalMaterialDto extends PartialType(CreateGlobalMaterialDto) {}

export class UpdateProjectMaterialDto extends PartialType(CreateProjectMaterialDto) {
  // Override globalMaterialId to be optional for updates
  globalMaterialId?: string;
}