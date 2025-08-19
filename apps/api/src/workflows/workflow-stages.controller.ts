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
import { WorkflowStagesService } from './workflow-stages.service';
import { CreateWorkflowStageDto, UpdateWorkflowStageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('workflow-stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowStagesController {
  constructor(private readonly workflowStagesService: WorkflowStagesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(@Body() createWorkflowStageDto: CreateWorkflowStageDto) {
    return this.workflowStagesService.create(createWorkflowStageDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(@Query('workflowId') workflowId?: string) {
    return this.workflowStagesService.findAll(workflowId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.workflowStagesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateWorkflowStageDto: UpdateWorkflowStageDto) {
    return this.workflowStagesService.update(id, updateWorkflowStageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.workflowStagesService.remove(id);
  }

  @Post('workflow/:workflowId/reorder')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  reorderStages(
    @Param('workflowId') workflowId: string,
    @Body('stageIds') stageIds: string[],
  ) {
    return this.workflowStagesService.reorderStages(workflowId, stageIds);
  }

  @Post(':id/move')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  moveStageToWorkflow(
    @Param('id') id: string,
    @Body('newWorkflowId') newWorkflowId: string,
    @Body('newOrder') newOrder?: number,
  ) {
    return this.workflowStagesService.moveStageToWorkflow(id, newWorkflowId, newOrder);
  }

  @Get(':id/tasks')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getStageTasks(@Param('id') id: string) {
    return this.workflowStagesService.getStageTasks(id);
  }
}
