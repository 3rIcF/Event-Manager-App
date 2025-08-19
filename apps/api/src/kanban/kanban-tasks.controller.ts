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
import { KanbanTasksService } from './kanban-tasks.service';
import { CreateKanbanTaskDto, UpdateKanbanTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('kanban-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KanbanTasksController {
  constructor(private readonly kanbanTasksService: KanbanTasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  create(@Body() createKanbanTaskDto: CreateKanbanTaskDto) {
    return this.kanbanTasksService.create(createKanbanTaskDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(
    @Query('columnId') columnId?: string,
    @Query('boardId') boardId?: string,
  ) {
    return this.kanbanTasksService.findAll(columnId, boardId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.kanbanTasksService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  update(@Param('id') id: string, @Body() updateKanbanTaskDto: UpdateKanbanTaskDto) {
    return this.kanbanTasksService.update(id, updateKanbanTaskDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.kanbanTasksService.remove(id);
  }

  @Post(':id/move')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  moveTask(
    @Param('id') id: string,
    @Body('newColumnId') newColumnId: string,
    @Body('newOrder') newOrder?: number,
  ) {
    return this.kanbanTasksService.moveTask(id, newColumnId, newOrder);
  }

  @Post('column/:columnId/reorder')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  reorderTasks(
    @Param('columnId') columnId: string,
    @Body('taskIds') taskIds: string[],
  ) {
    return this.kanbanTasksService.reorderTasks(columnId, taskIds);
  }

  @Get(':id/details')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getTaskDetails(@Param('id') id: string) {
    return this.kanbanTasksService.getTaskDetails(id);
  }
}
