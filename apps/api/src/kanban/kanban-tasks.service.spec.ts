import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KanbanTasksService } from './kanban-tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { 
  mockPrismaService, 
  mockKanbanTask, 
  mockKanbanColumn,
  mockKanbanBoard,
  mockUser,
  generateMockKanbanTasks,
  resetAllMocks
} from '../test-utils/test-utils';

describe('KanbanTasksService', () => {
  let service: KanbanTasksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanTasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<KanbanTasksService>(KanbanTasksService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    it('sollte erfolgreich eine neue Kanban Task erstellen', async () => {
      const createDto = {
        title: 'Test Task',
        description: 'Test Description',
        columnId: 'column-1',
        boardId: 'board-1',
        assigneeId: 'user-1'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.kanbanTask.count.mockResolvedValue(2);
      mockPrismaService.kanbanTask.create.mockResolvedValue({
        ...mockKanbanTask,
        ...createDto,
        order: 3
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockKanbanTask,
        ...createDto,
        order: 3
      });
      expect(mockPrismaService.kanbanColumn.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.columnId }
      });
      expect(mockPrismaService.kanbanBoard.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.boardId }
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.assigneeId }
      });
    });

    it('sollte NotFoundException werfen wenn Spalte nicht existiert', async () => {
      const createDto = {
        title: 'Test Task',
        columnId: 'non-existent-column',
        boardId: 'board-1'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Kanban column with ID ${createDto.columnId} not found`)
      );
    });

    it('sollte NotFoundException werfen wenn Board nicht existiert', async () => {
      const createDto = {
        title: 'Test Task',
        columnId: 'column-1',
        boardId: 'non-existent-board'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Kanban board with ID ${createDto.boardId} not found`)
      );
    });

    it('sollte NotFoundException werfen wenn Assignee nicht existiert', async () => {
      const createDto = {
        title: 'Test Task',
        columnId: 'column-1',
        boardId: 'board-1',
        assigneeId: 'non-existent-user'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${createDto.assigneeId} not found`)
      );
    });

    it('sollte automatisch die nächste Reihenfolge zuweisen wenn nicht angegeben', async () => {
      const createDto = {
        title: 'Test Task',
        columnId: 'column-1',
        boardId: 'board-1'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.kanbanTask.count.mockResolvedValue(2);
      mockPrismaService.kanbanTask.create.mockResolvedValue({
        ...mockKanbanTask,
        ...createDto,
        order: 3
      });

      const result = await service.create(createDto);

      expect(result.order).toBe(3);
      expect(mockPrismaService.kanbanTask.count).toHaveBeenCalledWith({
        where: { columnId: createDto.columnId }
      });
    });
  });

  describe('findAll', () => {
    it('sollte alle Kanban Tasks zurückgeben', async () => {
      const mockTasks = generateMockKanbanTasks(3);
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll();

      expect(result).toEqual(mockTasks);
    });

    it('sollte Kanban Tasks für ein spezifisches Board zurückgeben', async () => {
      const boardId = 'board-1';
      const mockTasks = generateMockKanbanTasks(2);
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll(boardId);

      expect(result).toEqual(mockTasks);
    });

    it('sollte Tasks nach Reihenfolge sortiert zurückgeben', async () => {
      const mockTasks = generateMockKanbanTasks(3);
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);

      await service.findAll();

      expect(mockPrismaService.kanbanTask.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          column: true,
          board: true,
          assignee: true,
          dependencies: {
            include: {
              dependentTask: true
            }
          }
        },
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('findOne', () => {
    it('sollte eine spezifische Kanban Task zurückgeben', async () => {
      const taskId = 'task-1';
      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);

      const result = await service.findOne(taskId);

      expect(result).toEqual(mockKanbanTask);
    });

    it('sollte NotFoundException werfen wenn Task nicht gefunden wird', async () => {
      const taskId = 'non-existent-task';
      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(
        new NotFoundException(`Kanban task with ID ${taskId} not found`)
      );
    });
  });

  describe('update', () => {
    it('sollte erfolgreich eine Kanban Task aktualisieren', async () => {
      const taskId = 'task-1';
      const updateDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'IN_PROGRESS' as const
      };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);
      mockPrismaService.kanbanTask.update.mockResolvedValue({
        ...mockKanbanTask,
        ...updateDto
      });

      const result = await service.update(taskId, updateDto);

      expect(result).toEqual({
        ...mockKanbanTask,
        ...updateDto
      });
    });

    it('sollte NotFoundException werfen wenn Task nicht existiert', async () => {
      const taskId = 'non-existent-task';
      const updateDto = { title: 'Updated Task' };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(null);

      await expect(service.update(taskId, updateDto)).rejects.toThrow(
        new NotFoundException(`Kanban task with ID ${taskId} not found`)
      );
    });

    it('sollte erfolgreich eine Task mit Spalten-Änderung aktualisieren', async () => {
      const taskId = 'task-1';
      const updateDto = {
        title: 'Updated Task',
        columnId: 'new-column-id'
      };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue({
        ...mockKanbanColumn,
        id: 'new-column-id'
      });
      mockPrismaService.kanbanTask.update.mockResolvedValue({
        ...mockKanbanTask,
        ...updateDto
      });

      const result = await service.update(taskId, updateDto);

      expect(result).toEqual({
        ...mockKanbanTask,
        ...updateDto
      });
      expect(mockPrismaService.kanbanColumn.findUnique).toHaveBeenCalledWith({
        where: { id: updateDto.columnId }
      });
    });

    it('sollte NotFoundException werfen wenn neue Spalte nicht existiert', async () => {
      const taskId = 'task-1';
      const updateDto = {
        title: 'Updated Task',
        columnId: 'non-existent-column'
      };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(null);

      await expect(service.update(taskId, updateDto)).rejects.toThrow(
        new NotFoundException(`Kanban column with ID ${updateDto.columnId} not found`)
      );
    });
  });

  describe('remove', () => {
    it('sollte erfolgreich eine Kanban Task löschen', async () => {
      const taskId = 'task-1';
      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);
      mockPrismaService.kanbanTask.delete.mockResolvedValue(mockKanbanTask);

      const result = await service.remove(taskId);

      expect(result).toEqual(mockKanbanTask);
    });

    it('sollte NotFoundException werfen wenn Task nicht existiert', async () => {
      const taskId = 'non-existent-task';
      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(null);

      await expect(service.remove(taskId)).rejects.toThrow(
        new NotFoundException(`Kanban task with ID ${taskId} not found`)
      );
    });
  });

  describe('moveTask', () => {
    it('sollte erfolgreich eine Task in eine andere Spalte verschieben', async () => {
      const taskId = 'task-1';
      const moveDto = {
        columnId: 'new-column-id',
        order: 2
      };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue({
        ...mockKanbanColumn,
        id: 'new-column-id'
      });
      mockPrismaService.kanbanTask.update.mockResolvedValue({
        ...mockKanbanTask,
        ...moveDto
      });

      const result = await service.moveTask(taskId, moveDto);

      expect(result).toEqual({
        ...mockKanbanTask,
        ...moveDto
      });
      expect(mockPrismaService.kanbanTask.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: moveDto,
        include: {
          column: true,
          board: true,
          assignee: true,
          dependencies: {
            include: {
              dependentTask: true
            }
          }
        }
      });
    });

    it('sollte NotFoundException werfen wenn Task nicht existiert', async () => {
      const taskId = 'non-existent-task';
      const moveDto = { columnId: 'new-column-id', order: 1 };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(null);

      await expect(service.moveTask(taskId, moveDto)).rejects.toThrow(
        new NotFoundException(`Kanban task with ID ${taskId} not found`)
      );
    });

    it('sollte NotFoundException werfen wenn neue Spalte nicht existiert', async () => {
      const taskId = 'task-1';
      const moveDto = {
        columnId: 'non-existent-column',
        order: 1
      };

      mockPrismaService.kanbanTask.findUnique.mockResolvedValue(mockKanbanTask);
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(null);

      await expect(service.moveTask(taskId, moveDto)).rejects.toThrow(
        new NotFoundException(`Kanban column with ID ${moveDto.columnId} not found`)
      );
    });
  });

  describe('reorderTasks', () => {
    it('sollte erfolgreich die Reihenfolge der Tasks neu ordnen', async () => {
      const columnId = 'column-1';
      const reorderDto = [
        { id: 'task-1', order: 1 },
        { id: 'task-2', order: 2 },
        { id: 'task-3', order: 3 }
      ];

      const mockTasks = generateMockKanbanTasks(3);
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.$transaction.mockResolvedValue(mockTasks);

      const result = await service.reorderTasks(columnId, reorderDto);

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn ungültige Reihenfolge-Daten übergeben werden', async () => {
      const columnId = 'column-1';
      const reorderDto = [
        { id: 'task-1', order: 1 },
        { id: 'task-2' } // Fehlende order
      ];

      await expect(service.reorderTasks(columnId, reorderDto)).rejects.toThrow(
        new BadRequestException('Invalid reorder data: missing order property')
      );
    });

    it('sollte BadRequestException werfen wenn Task nicht zur Spalte gehört', async () => {
      const columnId = 'column-1';
      const reorderDto = [
        { id: 'task-1', order: 1 },
        { id: 'task-2', order: 2 }
      ];

      const mockTasks = [
        { ...mockKanbanTask, id: 'task-1', columnId: 'different-column' }
      ];
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);

      await expect(service.reorderTasks(columnId, reorderDto)).rejects.toThrow(
        new BadRequestException('Task task-1 does not belong to column column-1')
      );
    });
  });

  describe('findByColumn', () => {
    it('sollte alle Tasks für eine spezifische Spalte zurückgeben', async () => {
      const columnId = 'column-1';
      const mockTasks = generateMockKanbanTasks(3);
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);

      const result = await service.findByColumn(columnId);

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.kanbanTask.findMany).toHaveBeenCalledWith({
        where: { columnId },
        include: {
          column: true,
          board: true,
          assignee: true,
          dependencies: {
            include: {
              dependentTask: true
            }
          }
        },
        orderBy: { order: 'asc' }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Tasks für Spalte gefunden werden', async () => {
      const columnId = 'column-1';
      mockPrismaService.kanbanTask.findMany.mockResolvedValue([]);

      const result = await service.findByColumn(columnId);

      expect(result).toEqual([]);
    });
  });

  describe('findByBoard', () => {
    it('sollte alle Tasks für ein spezifisches Board zurückgeben', async () => {
      const boardId = 'board-1';
      const mockTasks = generateMockKanbanTasks(3);
      mockPrismaService.kanbanTask.findMany.mockResolvedValue(mockTasks);

      const result = await service.findByBoard(boardId);

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.kanbanTask.findMany).toHaveBeenCalledWith({
        where: { boardId },
        include: {
          column: true,
          board: true,
          assignee: true,
          dependencies: {
            include: {
              dependentTask: true
            }
          }
        },
        orderBy: { order: 'asc' }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Tasks für Board gefunden werden', async () => {
      const boardId = 'board-1';
      mockPrismaService.kanbanTask.findMany.mockResolvedValue([]);

      const result = await service.findByBoard(boardId);

      expect(result).toEqual([]);
    });
  });
});
