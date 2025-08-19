import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { CreateGlobalMaterialDto, CreateProjectMaterialDto } from './dto/create-material.dto';
import { UpdateGlobalMaterialDto, UpdateProjectMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('materials')
@Controller('materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // Global Materials
  @Post('global')
  @ApiOperation({ summary: 'Create a new global material' })
  @ApiResponse({ status: 201, description: 'Global material created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createGlobalMaterial(@Body() createMaterialDto: CreateGlobalMaterialDto, @Request() req) {
    return this.materialsService.createGlobalMaterial(createMaterialDto, req.user.id);
  }

  @Get('global')
  @ApiOperation({ summary: 'Get all global materials' })
  @ApiResponse({ status: 200, description: 'Global materials retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllGlobalMaterials() {
    return this.materialsService.findAllGlobalMaterials();
  }

  @Get('global/:id')
  @ApiOperation({ summary: 'Get global material by ID' })
  @ApiParam({ name: 'id', description: 'Global material ID' })
  @ApiResponse({ status: 200, description: 'Global material retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Global material not found' })
  findOneGlobalMaterial(@Param('id') id: string) {
    return this.materialsService.findOneGlobalMaterial(id);
  }

  @Patch('global/:id')
  @ApiOperation({ summary: 'Update global material by ID' })
  @ApiParam({ name: 'id', description: 'Global material ID' })
  @ApiResponse({ status: 200, description: 'Global material updated successfully' })
  @ApiResponse({ status: 404, description: 'Global material not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Only creator or admin can update' })
  updateGlobalMaterial(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateGlobalMaterialDto,
    @Request() req
  ) {
    return this.materialsService.updateGlobalMaterial(id, updateMaterialDto, req.user.id);
  }

  @Delete('global/:id')
  @ApiOperation({ summary: 'Delete global material by ID' })
  @ApiParam({ name: 'id', description: 'Global material ID' })
  @ApiResponse({ status: 200, description: 'Global material deleted successfully' })
  @ApiResponse({ status: 404, description: 'Global material not found' })
  @ApiResponse({ status: 403, description: 'Access denied or material is in use' })
  removeGlobalMaterial(@Param('id') id: string, @Request() req) {
    return this.materialsService.removeGlobalMaterial(id, req.user.id);
  }

  // Project Materials
  @Post('projects/:projectId')
  @ApiOperation({ summary: 'Add material to project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Project material created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  createProjectMaterial(
    @Param('projectId') projectId: string,
    @Body() createMaterialDto: CreateProjectMaterialDto,
    @Request() req
  ) {
    return this.materialsService.createProjectMaterial(projectId, createMaterialDto, req.user.id);
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get all materials for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project materials retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findProjectMaterials(@Param('projectId') projectId: string, @Request() req) {
    return this.materialsService.findProjectMaterials(projectId, req.user.id);
  }

  @Patch('projects/:projectId/:materialId')
  @ApiOperation({ summary: 'Update project material' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'materialId', description: 'Project material ID' })
  @ApiResponse({ status: 200, description: 'Project material updated successfully' })
  @ApiResponse({ status: 404, description: 'Project material not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner or Manager role required' })
  updateProjectMaterial(
    @Param('projectId') projectId: string,
    @Param('materialId') materialId: string,
    @Body() updateMaterialDto: UpdateProjectMaterialDto,
    @Request() req
  ) {
    return this.materialsService.updateProjectMaterial(projectId, materialId, updateMaterialDto, req.user.id);
  }

  @Delete('projects/:projectId/:materialId')
  @ApiOperation({ summary: 'Remove material from project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiParam({ name: 'materialId', description: 'Project material ID' })
  @ApiResponse({ status: 200, description: 'Project material removed successfully' })
  @ApiResponse({ status: 404, description: 'Project material not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner or Manager role required' })
  removeProjectMaterial(
    @Param('projectId') projectId: string,
    @Param('materialId') materialId: string,
    @Request() req
  ) {
    return this.materialsService.removeProjectMaterial(projectId, materialId, req.user.id);
  }

  // Statistics
  @Get('stats')
  @ApiOperation({ summary: 'Get material statistics' })
  @ApiResponse({ status: 200, description: 'Material statistics retrieved successfully' })
  getMaterialStats() {
    return this.materialsService.getMaterialStats();
  }
}