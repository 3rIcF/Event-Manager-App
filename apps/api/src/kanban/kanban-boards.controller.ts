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
import { KanbanBoardsService } from './kanban-boards.service';
import { CreateKanbanBoardDto, UpdateKanbanBoardDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('kanban-boards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KanbanBoardsController {
  constructor(private readonly kanbanBoardsService: KanbanBoardsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(@Body() createKanbanBoardDto: CreateKanbanBoardDto) {
    return this.kanbanBoardsService.create(createKanbanBoardDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(@Query('projectId') projectId?: string) {
    return this.kanbanBoardsService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.kanbanBoardsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateKanbanBoardDto: UpdateKanbanBoardDto) {
    return this.kanbanBoardsService.update(id, updateKanbanBoardDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.kanbanBoardsService.remove(id);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  duplicateBoard(
    @Param('id') id: string,
    @Body('newName') newName: string,
    @Body('newProjectId') newProjectId?: string,
  ) {
    return this.kanbanBoardsService.duplicateBoard(id, newName, newProjectId);
  }

  @Get(':id/statistics')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getBoardStatistics(@Param('id') id: string) {
    return this.kanbanBoardsService.getBoardStatistics(id);
  }
}
