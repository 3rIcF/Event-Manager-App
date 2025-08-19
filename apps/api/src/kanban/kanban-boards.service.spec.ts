import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KanbanBoardsService } from './kanban-boards.service';
import { PrismaService } from '../prisma/prisma.service';
import { 
  mockPrismaService, 
  mockKanbanBoard, 
  mockProject,
  generateMockKanbanBoards,
  resetAllMocks
} from '../test-utils/test-utils';

describe('KanbanBoardsService', () => {
  let service: KanbanBoardsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanBoardsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<KanbanBoardsService>(KanbanBoardsService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    it('sollte erfolgreich ein neues Kanban Board erstellen', async () => {
      const createDto = {
        name: 'Test Board',
        description: 'Test Description',
        projectId: 'project-1'
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.kanbanBoard.create.mockResolvedValue({
        ...mockKanbanBoard,
        ...createDto
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockKanbanBoard,
        ...createDto
      });
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.projectId }
      });
    });

    it('sollte NotFoundException werfen wenn Projekt nicht existiert', async () => {
      const createDto = {
        name: 'Test Board',
        description: 'Test Description',
        projectId: 'non-existent-project'
      };

      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Project with ID ${createDto.projectId} not found`)
      );
    });
  });

  describe('findAll', () => {
    it('sollte alle Kanban Boards zurückgeben', async () => {
      const mockBoards = generateMockKanbanBoards(3);
      mockPrismaService.kanbanBoard.findMany.mockResolvedValue(mockBoards);

      const result = await service.findAll();

      expect(result).toEqual(mockBoards);
    });

    it('sollte Kanban Boards für ein spezifisches Projekt zurückgeben', async () => {
      const projectId = 'project-1';
      const mockBoards = generateMockKanbanBoards(2);
      mockPrismaService.kanbanBoard.findMany.mockResolvedValue(mockBoards);

      const result = await service.findAll(projectId);

      expect(result).toEqual(mockBoards);
    });
  });

  describe('findOne', () => {
    it('sollte ein spezifisches Kanban Board zurückgeben', async () => {
      const boardId = 'board-1';
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);

      const result = await service.findOne(boardId);

      expect(result).toEqual(mockKanbanBoard);
    });

    it('sollte NotFoundException werfen wenn Board nicht gefunden wird', async () => {
      const boardId = 'non-existent-board';
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(null);

      await expect(service.findOne(boardId)).rejects.toThrow(
        new NotFoundException(`Kanban board with ID ${boardId} not found`)
      );
    });
  });

  describe('update', () => {
    it('sollte erfolgreich ein Kanban Board aktualisieren', async () => {
      const boardId = 'board-1';
      const updateDto = {
        name: 'Updated Board',
        description: 'Updated Description'
      };

      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.kanbanBoard.update.mockResolvedValue({
        ...mockKanbanBoard,
        ...updateDto
      });

      const result = await service.update(boardId, updateDto);

      expect(result).toEqual({
        ...mockKanbanBoard,
        ...updateDto
      });
    });

    it('sollte NotFoundException werfen wenn Board nicht existiert', async () => {
      const boardId = 'non-existent-board';
      const updateDto = { name: 'Updated Board' };

      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(null);

      await expect(service.update(boardId, updateDto)).rejects.toThrow(
        new NotFoundException(`Kanban board with ID ${boardId} not found`)
      );
    });
  });

  describe('remove', () => {
    it('sollte erfolgreich ein Kanban Board löschen', async () => {
      const boardId = 'board-1';
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(mockKanbanBoard);
      mockPrismaService.kanbanBoard.delete.mockResolvedValue(mockKanbanBoard);

      const result = await service.remove(boardId);

      expect(result).toEqual(mockKanbanBoard);
    });

    it('sollte NotFoundException werfen wenn Board nicht existiert', async () => {
      const boardId = 'non-existent-board';
      mockPrismaService.kanbanBoard.findUnique.mockResolvedValue(null);

      await expect(service.remove(boardId)).rejects.toThrow(
        new NotFoundException(`Kanban board with ID ${boardId} not found`)
      );
    });
  });
});
