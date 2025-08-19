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
import { KanbanColumnsService } from './kanban-columns.service';
import { CreateKanbanColumnDto, UpdateKanbanColumnDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('kanban-columns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KanbanColumnsController {
  constructor(private readonly kanbanColumnsService: KanbanColumnsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(@Body() createKanbanColumnDto: CreateKanbanColumnDto) {
    return this.kanbanColumnsService.create(createKanbanColumnDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(@Query('boardId') boardId?: string) {
    return this.kanbanColumnsService.findAll(boardId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.kanbanColumnsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateKanbanColumnDto: UpdateKanbanColumnDto) {
    return this.kanbanColumnsService.update(id, updateKanbanColumnDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.kanbanColumnsService.remove(id);
  }

  @Post('board/:boardId/reorder')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  reorderColumns(
    @Param('boardId') boardId: string,
    @Body('columnIds') columnIds: string[],
  ) {
    return this.kanbanColumnsService.reorderColumns(boardId, columnIds);
  }

  @Post(':id/move')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  moveColumnToBoard(
    @Param('id') id: string,
    @Body('newBoardId') newBoardId: string,
    @Body('newOrder') newOrder?: number,
  ) {
    return this.kanbanColumnsService.moveColumnToBoard(id, newBoardId, newOrder);
  }

  @Get(':id/tasks')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getColumnTasks(@Param('id') id: string) {
    return this.kanbanColumnsService.getColumnTasks(id);
  }
}
