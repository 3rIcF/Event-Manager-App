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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto, UpdateProjectMemberDto } from './dto/project-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects accessible to the current user' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner or Manager role required' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project by ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner role required' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get project members' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project members retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getMembers(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProjectMembers(id, req.user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project (Owner/Manager only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'User already a member or not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner or Manager role required' })
  addMember(@Param('id') id: string, @Body() addMemberDto: AddProjectMemberDto, @Request() req) {
    return this.projectsService.addProjectMember(id, addMemberDto, req.user.id);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update project member role (Owner/Manager only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({ status: 404, description: 'Project member not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner or Manager role required' })
  updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberDto: UpdateProjectMemberDto,
    @Request() req
  ) {
    return this.projectsService.updateProjectMember(id, userId, updateMemberDto, req.user.id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from project (Owner/Manager only)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove last owner' })
  @ApiResponse({ status: 404, description: 'Project member not found' })
  @ApiResponse({ status: 403, description: 'Access denied - Owner or Manager role required' })
  removeMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    return this.projectsService.removeProjectMember(id, userId, req.user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getStats(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProjectStats(id, req.user.id);
  }
}