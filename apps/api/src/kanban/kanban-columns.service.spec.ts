import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KanbanColumnsService } from './kanban-columns.service';
import { PrismaService } from '../prisma/prisma.service';
import { 
  mockPrismaService, 
  mockKanbanColumn, 
  mockKanbanBoard,
  generateMockKanbanColumns,
  resetAllMocks
} from '../test-utils/test-utils';

describe('KanbanColumnsService', () => {
  let service: KanbanColumnsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanColumnsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<KanbanColumnsService>(KanbanColumnsService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    it('sollte erfolgreich eine neue Kanban Spalte erstellen', async () => {
      const createDto = {
        name: 'To Do',
        order: 1,
        boardId: 'board-1'
      };

      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.kanbanColumn.create.mockResolvedValue({
        ...mockKanbanColumn,
        ...createDto
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockKanbanColumn,
        ...createDto
      });
      expect(mockPrismaService.kanbanBoard.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.boardId }
      });
    });

    it('sollte NotFoundException werfen wenn Board nicht existiert', async () => {
      const createDto = {
        name: 'To Do',
        order: 1,
        boardId: 'non-existent-board'
      };

      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Kanban board with ID ${createDto.boardId} not found`)
      );
    });

    it('sollte automatisch die nächste Reihenfolge zuweisen wenn nicht angegeben', async () => {
      const createDto = {
        name: 'To Do',
        boardId: 'board-1'
      };

      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.kanbanColumn.count.mockResolvedValue(2);
      mockPrismaService.kanbanColumn.create.mockResolvedValue({
        ...mockKanbanColumn,
        ...createDto,
        order: 3
      });

      const result = await service.create(createDto);

      expect(result.order).toBe(3);
      expect(mockPrismaService.kanbanColumn.count).toHaveBeenCalledWith({
        where: { boardId: createDto.boardId }
      });
    });
  });

  describe('findAll', () => {
    it('sollte alle Kanban Spalten zurückgeben', async () => {
      const mockColumns = generateMockKanbanColumns(3);
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue(mockColumns);

      const result = await service.findAll();

      expect(result).toEqual(mockColumns);
    });

    it('sollte Kanban Spalten für ein spezifisches Board zurückgeben', async () => {
      const boardId = 'board-1';
      const mockColumns = generateMockKanbanColumns(2);
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue(mockColumns);

      const result = await service.findAll(boardId);

      expect(result).toEqual(mockColumns);
    });

    it('sollte Spalten nach Reihenfolge sortiert zurückgeben', async () => {
      const mockColumns = generateMockKanbanColumns(3);
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue(mockColumns);

      await service.findAll();

      expect(mockPrismaService.kanbanColumn.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          board: true,
          tasks: {
            include: {
              assignee: true
            },
            orderBy: {}
          }
        },
        orderBy: { order: 'asc' }
      });
    });
  });

  describe('findOne', () => {
    it('sollte eine spezifische Kanban Spalte zurückgeben', async () => {
      const columnId = 'column-1';
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);

      const result = await service.findOne(columnId);

      expect(result).toEqual(mockKanbanColumn);
    });

    it('sollte NotFoundException werfen wenn Spalte nicht gefunden wird', async () => {
      const columnId = 'non-existent-column';
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(null);

      await expect(service.findOne(columnId)).rejects.toThrow(
        new NotFoundException(`Kanban column with ID ${columnId} not found`)
      );
    });
  });

  describe('update', () => {
    it('sollte erfolgreich eine Kanban Spalte aktualisieren', async () => {
      const columnId = 'column-1';
      const updateDto = {
        name: 'Updated Column',
        order: 2
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanColumn.update.mockResolvedValue({
        ...mockKanbanColumn,
        ...updateDto
      });

      const result = await service.update(columnId, updateDto);

      expect(result).toEqual({
        ...mockKanbanColumn,
        ...updateDto
      });
    });

    it('sollte NotFoundException werfen wenn Spalte nicht existiert', async () => {
      const columnId = 'non-existent-column';
      const updateDto = { name: 'Updated Column' };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(null);

      await expect(service.update(columnId, updateDto)).rejects.toThrow(
        new NotFoundException(`Kanban column with ID ${columnId} not found`)
      );
    });

    it('sollte erfolgreich eine Spalte mit Board-Änderung aktualisieren', async () => {
      const columnId = 'column-1';
      const updateDto = {
        name: 'Updated Column',
        boardId: 'new-board-id'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue({
        ...mockKanbanBoard,
        id: 'new-board-id'
      });
      mockPrismaService.kanbanColumn.update.mockResolvedValue({
        ...mockKanbanColumn,
        ...updateDto
      });

      const result = await service.update(columnId, updateDto);

      expect(result).toEqual({
        ...mockKanbanColumn,
        ...updateDto
      });
      expect(mockPrismaService.kanbanBoard.findUnique).toHaveBeenCalledWith({
        where: { id: updateDto.boardId }
      });
    });

    it('sollte NotFoundException werfen wenn neues Board nicht existiert', async () => {
      const columnId = 'column-1';
      const updateDto = {
        name: 'Updated Column',
        boardId: 'non-existent-board'
      };

      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(null);

      await expect(service.update(columnId, updateDto)).rejects.toThrow(
        new NotFoundException(`Kanban board with ID ${updateDto.boardId} not found`)
      );
    });
  });

  describe('remove', () => {
    it('sollte erfolgreich eine Kanban Spalte löschen', async () => {
      const columnId = 'column-1';
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(mockKanbanColumn);
      mockPrismaService.kanbanColumn.delete.mockResolvedValue(mockKanbanColumn);

      const result = await service.remove(columnId);

      expect(result).toEqual(mockKanbanColumn);
    });

    it('sollte NotFoundException werfen wenn Spalte nicht existiert', async () => {
      const columnId = 'non-existent-column';
      mockPrismaService.kanbanColumn.findUnique.mockResolvedValue(null);

      await expect(service.remove(columnId)).rejects.toThrow(
        new NotFoundException(`Kanban column with ID ${columnId} not found`)
      );
    });
  });

  describe('reorderColumns', () => {
    it('sollte erfolgreich die Reihenfolge der Spalten neu ordnen', async () => {
      const boardId = 'board-1';
      const reorderDto = [
        { id: 'column-1', order: 1 },
        { id: 'column-2', order: 2 },
        { id: 'column-3', order: 3 }
      ];

      const mockColumns = generateMockKanbanColumns(3);
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue(mockColumns);
      mockPrismaService.$transaction.mockResolvedValue(mockColumns);

      const result = await service.reorderColumns(boardId, reorderDto);

      expect(result).toEqual(mockColumns);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn ungültige Reihenfolge-Daten übergeben werden', async () => {
      const boardId = 'board-1';
      const reorderDto = [
        { id: 'column-1', order: 1 },
        { id: 'column-2' } // Fehlende order
      ];

      await expect(service.reorderColumns(boardId, reorderDto)).rejects.toThrow(
        new BadRequestException('Invalid reorder data: missing order property')
      );
    });

    it('sollte BadRequestException werfen wenn Spalte nicht zum Board gehört', async () => {
      const boardId = 'board-1';
      const reorderDto = [
        { id: 'column-1', order: 1 },
        { id: 'column-2', order: 2 }
      ];

      const mockColumns = [
        { ...mockKanbanColumn, id: 'column-1', boardId: 'different-board' }
      ];
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue(mockColumns);

      await expect(service.reorderColumns(boardId, reorderDto)).rejects.toThrow(
        new BadRequestException('Column column-1 does not belong to board board-1')
      );
    });
  });

  describe('findByBoard', () => {
    it('sollte alle Spalten für ein spezifisches Board zurückgeben', async () => {
      const boardId = 'board-1';
      const mockColumns = generateMockKanbanColumns(3);
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue(mockColumns);

      const result = await service.findByBoard(boardId);

      expect(result).toEqual(mockColumns);
      expect(mockPrismaService.kanbanColumn.findMany).toHaveBeenCalledWith({
        where: { boardId },
        include: {
          board: true,
          tasks: {
            include: {
              assignee: true
            },
            orderBy: {}
          }
        },
        orderBy: { order: 'asc' }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Spalten für Board gefunden werden', async () => {
      const boardId = 'board-1';
      mockPrismaService.kanbanColumn.findMany.mockResolvedValue([]);

      const result = await service.findByBoard(boardId);

      expect(result).toEqual([]);
    });
  });
});
