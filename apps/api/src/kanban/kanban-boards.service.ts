import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKanbanBoardDto, UpdateKanbanBoardDto } from './dto';

@Injectable()
export class KanbanBoardsService {
  constructor(private prisma: PrismaService) {}

  async create(createKanbanBoardDto: CreateKanbanBoardDto) {
    const { projectId, ...boardData } = createKanbanBoardDto;

    // Validate project exists
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    return this.prisma.kanbanBoard.create({
      data: {
        ...boardData,
        ...(projectId && { project: { connect: { id: projectId } } }),
      },
      include: {
        project: true,
        columns: {
          orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
          include: {
            tasks: {
              include: {
                // assignee: true, // Nicht im Schema verfügbar
              },
            },
          },
        },
      },
    });
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    
    return this.prisma.kanbanBoard.findMany({
      where,
      include: {
        project: true,
        columns: {
          orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
          include: {
            tasks: {
              include: {
                // assignee: true, // Nicht im Schema verfügbar
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        project: true,
        columns: {
          orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
          include: {
            tasks: {
              include: {
                // assignee: true, // Nicht im Schema verfügbar
                dependencies: {
                  include: {
                    dependentTask: true,
                  },
                },
              },
              orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Kanban board with ID ${id} not found`);
    }

    return board;
  }

  async update(id: string, updateKanbanBoardDto: UpdateKanbanBoardDto) {
    const { projectId, ...updateData } = updateKanbanBoardDto;

    // Check if board exists
    const existingBoard = await this.prisma.kanbanBoard.findUnique({
      where: { id },
    });
    if (!existingBoard) {
      throw new NotFoundException(`Kanban board with ID ${id} not found`);
    }

    // Validate project if changing
    if (projectId && projectId !== existingBoard.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    return this.prisma.kanbanBoard.update({
      where: { id },
      data: {
        ...updateData,
        ...(projectId && { project: { connect: { id: projectId } } }),
      },
      include: {
        project: true,
        columns: {
          orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
          include: {
            tasks: {
              include: {
                // assignee: true, // Nicht im Schema verfügbar
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if board exists
    const existingBoard = await this.prisma.kanbanBoard.findUnique({
      where: { id },
    });
    if (!existingBoard) {
      throw new NotFoundException(`Kanban board with ID ${id} not found`);
    }

    // Check if board has columns with tasks
    const columns = await this.prisma.kanbanColumn.findMany({
      where: { boardId: id },
      include: {
        tasks: true,
      },
    });

    const hasTasks = columns.some(column => column.tasks.length > 0);
    if (hasTasks) {
      throw new BadRequestException('Cannot delete board with tasks. Remove tasks first.');
    }

    // Delete columns first
    await this.prisma.kanbanColumn.deleteMany({
      where: { boardId: id },
    });

    // Delete the board
    return this.prisma.kanbanBoard.delete({
      where: { id },
    });
  }

  async duplicateBoard(id: string, newName: string, newProjectId?: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        columns: true,
      },
    });

    if (!board) {
      throw new NotFoundException(`Kanban board with ID ${id} not found`);
    }

    // Create new board
    const newBoard = await this.prisma.kanbanBoard.create({
      data: {
        name: newName,
        description: board.description,
        projectId: newProjectId || board.projectId,
        isActive: true,
        metadata: board.metadata,
      },
    });

    // Duplicate columns
    if (board.columns.length > 0) {
      const columnData = board.columns.map(column => ({
        boardId: newBoard.id,
        name: column.name,
        description: column.description,
        order: column.order,
        color: column.color,
        maxTasks: column.maxTasks,
        metadata: column.metadata,
      }));

      await this.prisma.kanbanColumn.createMany({
        data: columnData,
      });
    }

    return this.prisma.kanbanBoard.findUnique({
      where: { id: newBoard.id },
      include: {
        project: true,
        columns: {
          orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
        },
      },
    });
  }

  async getBoardStatistics(id: string) {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { // order: 'asc' // Nicht im Schema verfügbar },
          include: {
            tasks: {
              include: {
                // assignee: true, // Nicht im Schema verfügbar
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Kanban board with ID ${id} not found`);
    }

    const totalTasks = board.columns.reduce((total, column) => total + column.tasks.length, 0);
    const totalColumns = board.columns.length;

    const columnStats = board.columns.map(column => ({
      id: column.id,
      name: column.name,
      totalTasks: column.tasks.length,
      maxTasks: column.maxTasks,
      utilization: column.maxTasks ? (column.tasks.length / column.maxTasks) * 100 : 0,
      tasks: column.tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
      })),
    }));

    return {
      boardId: id,
      boardName: board.name,
      totalTasks,
      totalColumns,
      columnStats,
      overallUtilization: totalColumns > 0 ? columnStats.reduce((sum, col) => sum + col.utilization, 0) / totalColumns : 0,
    };
  }
}
