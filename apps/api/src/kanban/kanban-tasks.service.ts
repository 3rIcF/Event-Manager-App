import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKanbanTaskDto, UpdateKanbanTaskDto } from './dto';

@Injectable()
export class KanbanTasksService {
  constructor(private prisma: PrismaService) {}

  async create(createKanbanTaskDto: CreateKanbanTaskDto) {
    const { taskId, columnId, ...taskData } = createKanbanTaskDto;

    // Validate task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Validate column exists
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException(`Kanban column with ID ${columnId} not found`);
    }

    // Check if column has max tasks limit
    if (column.maxTasks) {
      const currentTaskCount = await this.prisma.kanbanTask.count({
        where: { columnId },
      });
      if (currentTaskCount >= column.maxTasks) {
        throw new BadRequestException(`Column ${column.name} has reached its maximum task limit`);
      }
    }

    // If position is not provided, set it to the next available position
    if (!taskData.position) {
      const lastTask = await this.prisma.kanbanTask.findFirst({
        where: { columnId },
        orderBy: { position: 'desc' },
      });
      taskData.position = lastTask ? lastTask.position + 1 : 1;
    }

    return this.prisma.kanbanTask.create({
      data: {
        ...taskData,
        taskId: taskId,
        columnId: columnId,
      },
      include: {
        task: true,
        column: {
          include: {
            board: true,
          },
        },
      },
    });
  }

  async findAll(columnId?: string) {
    const where = columnId ? { columnId } : {};
    
    return this.prisma.kanbanTask.findMany({
      where,
      include: {
        column: {
          include: {
            board: true,
          },
        },
        task: true,
      },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    const kanbanTask = await this.prisma.kanbanTask.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            board: true,
          },
        },
        task: {
          include: {
            project: true,
            assignee: true,
          },
        },
      },
    });

    if (!kanbanTask) {
      throw new NotFoundException(`Kanban task with ID ${id} not found`);
    }

    return kanbanTask;
  }

  async update(id: string, updateKanbanTaskDto: UpdateKanbanTaskDto) {
    // Check if kanban task exists
    const existingKanbanTask = await this.prisma.kanbanTask.findUnique({
      where: { id },
    });
    if (!existingKanbanTask) {
      throw new NotFoundException(`Kanban task with ID ${id} not found`);
    }

    return this.prisma.kanbanTask.update({
      where: { id },
      data: updateKanbanTaskDto,
      include: {
        column: {
          include: {
            board: true,
          },
        },
        task: {
          include: {
            project: true,
            assignee: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if kanban task exists
    const existingKanbanTask = await this.prisma.kanbanTask.findUnique({
      where: { id },
    });
    if (!existingKanbanTask) {
      throw new NotFoundException(`Kanban task with ID ${id} not found`);
    }

    return this.prisma.kanbanTask.delete({
      where: { id },
    });
  }

  async moveTask(id: string, newColumnId: string, newPosition: number) {
    // Check if kanban task exists
    const existingKanbanTask = await this.prisma.kanbanTask.findUnique({
      where: { id },
    });
    if (!existingKanbanTask) {
      throw new NotFoundException(`Kanban task with ID ${id} not found`);
    }

    // Check if new column exists
    const newColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id: newColumnId },
    });
    if (!newColumn) {
      throw new NotFoundException(`Column with ID ${newColumnId} not found`);
    }

    // Update task position
    return this.prisma.kanbanTask.update({
      where: { id },
      data: {
        columnId: newColumnId,
        position: newPosition,
      },
      include: {
        column: {
          include: {
            board: true,
          },
        },
        task: {
          include: {
            project: true,
            assignee: true,
          },
        },
      },
    });
  }

  async reorderTasks(columnId: string, taskIds: string[]) {
    // Check if column exists
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    // Update positions for all tasks
    const updates = taskIds.map((taskId, index) =>
      this.prisma.kanbanTask.update({
        where: { id: taskId },
        data: { position: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    // Return updated tasks
    return this.prisma.kanbanTask.findMany({
      where: { columnId },
      include: {
        column: {
          include: {
            board: true,
          },
        },
        task: {
          include: {
            project: true,
            assignee: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  async getTaskDetails(id: string) {
    const kanbanTask = await this.prisma.kanbanTask.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            // assignee: true, // Nicht im Schema verf�gbar
            dependencies: {
              include: {
                dependentTask: true,
              },
            },
            timeLogs: {
              include: {
                user: true,
              },
              orderBy: { startTime: 'desc' },
            },
            comments: {
              include: {
                user: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            attachments: {
              include: {
                file: true,
              },
            },
          },
        },
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!kanbanTask) {
      throw new NotFoundException(`Kanban task with ID ${id} not found`);
    }

    return kanbanTask;
  }
}
