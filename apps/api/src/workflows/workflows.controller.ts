import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(createWorkflowDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(@Query('projectId') projectId?: string) {
    return this.workflowsService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  duplicateWorkflow(
    @Param('id') id: string,
    @Body('newName') newName: string,
    @Body('newProjectId') newProjectId?: string,
  ) {
    return this.workflowsService.duplicateWorkflow(id, newName, newProjectId);
  }

  @Get(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getWorkflowProgress(@Param('id') id: string) {
    return this.workflowsService.getWorkflowProgress(id);
  }
}
