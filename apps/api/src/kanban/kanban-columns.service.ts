import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKanbanColumnDto, UpdateKanbanColumnDto } from './dto';

@Injectable()
export class KanbanColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(createKanbanColumnDto: CreateKanbanColumnDto) {
    const { boardId, ...columnData } = createKanbanColumnDto;

    // Validate board exists
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`Kanban board with ID ${boardId} not found`);
    }

    // If order is not provided, set it to the next available order
    if (!columnData.order) {
      const lastColumn = await this.prisma.kanbanColumn.findFirst({
        where: { boardId },
        orderBy: { order: 'desc' },
      });
      columnData.order = lastColumn ? lastColumn.order + 1 : 1;
    }

    return this.prisma.kanbanColumn.create({
      data: {
        ...columnData,
        boardId: boardId,
      },
      include: {
        board: true,
        tasks: {
          include: {
            task: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findAll(boardId?: string) {
    const where = boardId ? { boardId } : {};
    
    return this.prisma.kanbanColumn.findMany({
      where,
      include: {
        board: true,
        tasks: {
          include: {
            task: true,
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id },
      include: {
        board: true,
        tasks: {
          include: {
            task: true,

          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!column) {
      throw new NotFoundException(`Kanban column with ID ${id} not found`);
    }

    return column;
  }

  async update(id: string, updateKanbanColumnDto: UpdateKanbanColumnDto) {
    // Check if column exists
    const existingColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id },
    });
    if (!existingColumn) {
      throw new NotFoundException(`Kanban column with ID ${id} not found`);
    }

    return this.prisma.kanbanColumn.update({
      where: { id },
      data: updateKanbanColumnDto,
      include: {
        board: true,
        tasks: {
          include: {
            task: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if column exists
    const existingColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id },
    });
    if (!existingColumn) {
      throw new NotFoundException(`Kanban column with ID ${id} not found`);
    }

    // Check if column has tasks
    const tasks = await this.prisma.kanbanTask.findMany({
      where: { columnId: id },
    });

    if (tasks.length > 0) {
      throw new BadRequestException('Cannot delete column with tasks. Move or remove tasks first.');
    }

    return this.prisma.kanbanColumn.delete({
      where: { id },
    });
  }

  async reorderColumns(boardId: string, columnIds: string[]) {
    // Validate board exists
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`Kanban board with ID ${boardId} not found`);
    }

    // Validate all columns belong to the board
    const columns = await this.prisma.kanbanColumn.findMany({
      where: { id: { in: columnIds } },
    });

    if (columns.length !== columnIds.length) {
      throw new BadRequestException('Some columns not found');
    }

    const invalidColumns = columns.filter(column => column.boardId !== boardId);
    if (invalidColumns.length > 0) {
      throw new BadRequestException('Some columns do not belong to the specified board');
    }

    // Update order for each column
    const updates = columnIds.map((columnId, index) => 
      this.prisma.kanbanColumn.update({
        where: { id: columnId },
        data: { order: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return this.prisma.kanbanColumn.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: {
        board: true,
        tasks: {
          include: {
            task: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async moveColumnToBoard(columnId: string, newBoardId: string, newOrder?: number) {
    // Check if column exists
    const existingColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });
    if (!existingColumn) {
      throw new NotFoundException(`Kanban column with ID ${columnId} not found`);
    }

    // Validate new board exists
    const newBoard = await this.prisma.kanbanBoard.findUnique({
      where: { id: newBoardId },
    });
    if (!newBoard) {
      throw new NotFoundException(`Kanban board with ID ${newBoardId} not found`);
    }

    // If new order is not provided, set it to the next available order
    if (!newOrder) {
      const lastColumn = await this.prisma.kanbanColumn.findFirst({
        where: { boardId: newBoardId },
        orderBy: { order: 'desc' },
      });
      newOrder = lastColumn ? lastColumn.order + 1 : 1;
    }

    return this.prisma.kanbanColumn.update({
      where: { id: columnId },
      data: {
        boardId: newBoardId,
        order: newOrder,
      },
      include: {
        board: true,
        tasks: {
          include: {
            task: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async getColumnTasks(id: string) {
    const column = await this.prisma.kanbanColumn.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            task: true,

          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!column) {
      throw new NotFoundException(`Kanban column with ID ${id} not found`);
    }

    return column.tasks;
  }
}
