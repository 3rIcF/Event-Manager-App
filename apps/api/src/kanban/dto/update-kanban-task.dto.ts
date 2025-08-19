import { PartialType } from '@nestjs/mapped-types';
import { CreateKanbanTaskDto } from './create-kanban-task.dto';

export class UpdateKanbanTaskDto extends PartialType(CreateKanbanTaskDto) {}
