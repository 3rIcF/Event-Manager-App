import { Module } from '@nestjs/common';
import { KanbanBoardsController } from './kanban-boards.controller';
import { KanbanBoardsService } from './kanban-boards.service';
import { KanbanColumnsController } from './kanban-columns.controller';
import { KanbanColumnsService } from './kanban-columns.service';
import { KanbanTasksController } from './kanban-tasks.controller';
import { KanbanTasksService } from './kanban-tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KanbanBoardsController, KanbanColumnsController, KanbanTasksController],
  providers: [KanbanBoardsService, KanbanColumnsService, KanbanTasksService],
  exports: [KanbanBoardsService, KanbanColumnsService, KanbanTasksService],
})
export class KanbanModule {}
