import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkflowStagesService } from './workflow-stages.service';
import { PrismaService } from '../prisma/prisma.service';
import { 
  mockPrismaService, 
  mockWorkflowStage, 
  mockWorkflow,
  generateMockWorkflowStages,
  resetAllMocks
} from '../test-utils/test-utils';

describe('WorkflowStagesService', () => {
  let service: WorkflowStagesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowStagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<WorkflowStagesService>(WorkflowStagesService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    it('sollte erfolgreich eine neue Workflow Stage erstellen', async () => {
      const createDto = {
        name: 'Planning',
        description: 'Planning Stage',
        order: 1,
        workflowId: 'workflow-1'
      };

      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.workflowStage.create.mockResolvedValue({
        ...mockWorkflowStage,
        ...createDto
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockWorkflowStage,
        ...createDto
      });
      expect(mockPrismaService.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.workflowId }
      });
    });

    it('sollte NotFoundException werfen wenn Workflow nicht existiert', async () => {
      const createDto = {
        name: 'Planning',
        order: 1,
        workflowId: 'non-existent-workflow'
      };

      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${createDto.workflowId} not found`)
      );
    });

    it('sollte automatisch die nächste Reihenfolge zuweisen wenn nicht angegeben', async () => {
      const createDto = {
        name: 'Planning',
        description: 'Planning Stage',
        workflowId: 'workflow-1'
      };

      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.workflowStage.count.mockResolvedValue(2);
      mockPrismaService.workflowStage.create.mockResolvedValue({
        ...mockWorkflowStage,
        ...createDto,
        order: 3
      });

      const result = await service.create(createDto);

      expect(result.order).toBe(3);
      expect(mockPrismaService.workflowStage.count).toHaveBeenCalledWith({
        where: { workflowId: createDto.workflowId }
      });
    });
  });

  describe('findAll', () => {
    it('sollte alle Workflow Stages zurückgeben', async () => {
      const mockStages = generateMockWorkflowStages(3);
      mockPrismaService.workflowStage.findMany.mockResolvedValue(mockStages);

      const result = await service.findAll();

      expect(result).toEqual(mockStages);
    });

    it('sollte Workflow Stages für einen spezifischen Workflow zurückgeben', async () => {
      const workflowId = 'workflow-1';
      const mockStages = generateMockWorkflowStages(2);
      mockPrismaService.workflowStage.findMany.mockResolvedValue(mockStages);

      const result = await service.findAll(workflowId);

      expect(result).toEqual(mockStages);
    });

    it('sollte Stages nach Reihenfolge sortiert zurückgeben', async () => {
      const mockStages = generateMockWorkflowStages(3);
      mockPrismaService.workflowStage.findMany.mockResolvedValue(mockStages);

      await service.findAll();

      expect(mockPrismaService.workflowStage.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          workflow: true,
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
    it('sollte eine spezifische Workflow Stage zurückgeben', async () => {
      const stageId = 'stage-1';
      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);

      const result = await service.findOne(stageId);

      expect(result).toEqual(mockWorkflowStage);
    });

    it('sollte NotFoundException werfen wenn Stage nicht gefunden wird', async () => {
      const stageId = 'non-existent-stage';
      mockPrismaService.workflowStage.findUnique.mockResolvedValue(null);

      await expect(service.findOne(stageId)).rejects.toThrow(
        new NotFoundException(`Workflow stage with ID ${stageId} not found`)
      );
    });
  });

  describe('update', () => {
    it('sollte erfolgreich eine Workflow Stage aktualisieren', async () => {
      const stageId = 'stage-1';
      const updateDto = {
        name: 'Updated Stage',
        description: 'Updated Description',
        order: 2
      };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);
      mockPrismaService.workflowStage.update.mockResolvedValue({
        ...mockWorkflowStage,
        ...updateDto
      });

      const result = await service.update(stageId, updateDto);

      expect(result).toEqual({
        ...mockWorkflowStage,
        ...updateDto
      });
    });

    it('sollte NotFoundException werfen wenn Stage nicht existiert', async () => {
      const stageId = 'non-existent-stage';
      const updateDto = { name: 'Updated Stage' };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(null);

      await expect(service.update(stageId, updateDto)).rejects.toThrow(
        new NotFoundException(`Workflow stage with ID ${stageId} not found`)
      );
    });

    it('sollte erfolgreich eine Stage mit Workflow-Änderung aktualisieren', async () => {
      const stageId = 'stage-1';
      const updateDto = {
        name: 'Updated Stage',
        workflowId: 'new-workflow-id'
      };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);
      mockPrismaService.workflow.findUnique.mockResolvedValue({
        ...mockWorkflow,
        id: 'new-workflow-id'
      });
      mockPrismaService.workflowStage.update.mockResolvedValue({
        ...mockWorkflowStage,
        ...updateDto
      });

      const result = await service.update(stageId, updateDto);

      expect(result).toEqual({
        ...mockWorkflowStage,
        ...updateDto
      });
      expect(mockPrismaService.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: updateDto.workflowId }
      });
    });

    it('sollte NotFoundException werfen wenn neuer Workflow nicht existiert', async () => {
      const stageId = 'stage-1';
      const updateDto = {
        name: 'Updated Stage',
        workflowId: 'non-existent-workflow'
      };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);
      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.update(stageId, updateDto)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${updateDto.workflowId} not found`)
      );
    });
  });

  describe('remove', () => {
    it('sollte erfolgreich eine Workflow Stage löschen', async () => {
      const stageId = 'stage-1';
      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);
      mockPrismaService.workflowStage.delete.mockResolvedValue(mockWorkflowStage);

      const result = await service.remove(stageId);

      expect(result).toEqual(mockWorkflowStage);
    });

    it('sollte NotFoundException werfen wenn Stage nicht existiert', async () => {
      const stageId = 'non-existent-stage';
      mockPrismaService.workflowStage.findUnique.mockResolvedValue(null);

      await expect(service.remove(stageId)).rejects.toThrow(
        new NotFoundException(`Workflow stage with ID ${stageId} not found`)
      );
    });
  });

  describe('reorderStages', () => {
    it('sollte erfolgreich die Reihenfolge der Stages neu ordnen', async () => {
      const workflowId = 'workflow-1';
      const reorderDto = [
        { id: 'stage-1', order: 1 },
        { id: 'stage-2', order: 2 },
        { id: 'stage-3', order: 3 }
      ];

      const mockStages = generateMockWorkflowStages(3);
      mockPrismaService.workflowStage.findMany.mockResolvedValue(mockStages);
      mockPrismaService.$transaction.mockResolvedValue(mockStages);

      const result = await service.reorderStages(workflowId, reorderDto);

      expect(result).toEqual(mockStages);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn ungültige Reihenfolge-Daten übergeben werden', async () => {
      const workflowId = 'workflow-1';
      const reorderDto = [
        { id: 'stage-1', order: 1 },
        { id: 'stage-2' } // Fehlende order
      ];

      await expect(service.reorderStages(workflowId, reorderDto)).rejects.toThrow(
        new BadRequestException('Invalid reorder data: missing order property')
      );
    });

    it('sollte BadRequestException werfen wenn Stage nicht zum Workflow gehört', async () => {
      const workflowId = 'workflow-1';
      const reorderDto = [
        { id: 'stage-1', order: 1 },
        { id: 'stage-2', order: 2 }
      ];

      const mockStages = [
        { ...mockWorkflowStage, id: 'stage-1', workflowId: 'different-workflow' }
      ];
      mockPrismaService.workflowStage.findMany.mockResolvedValue(mockStages);

      await expect(service.reorderStages(workflowId, reorderDto)).rejects.toThrow(
        new BadRequestException('Stage stage-1 does not belong to workflow workflow-1')
      );
    });
  });

  describe('findByWorkflow', () => {
    it('sollte alle Stages für einen spezifischen Workflow zurückgeben', async () => {
      const workflowId = 'workflow-1';
      const mockStages = generateMockWorkflowStages(3);
      mockPrismaService.workflowStage.findMany.mockResolvedValue(mockStages);

      const result = await service.findByWorkflow(workflowId);

      expect(result).toEqual(mockStages);
      expect(mockPrismaService.workflowStage.findMany).toHaveBeenCalledWith({
        where: { workflowId },
        include: {
          workflow: true,
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

    it('sollte leeres Array zurückgeben wenn keine Stages für Workflow gefunden werden', async () => {
      const workflowId = 'workflow-1';
      mockPrismaService.workflowStage.findMany.mockResolvedValue([]);

      const result = await service.findByWorkflow(workflowId);

      expect(result).toEqual([]);
    });
  });

  describe('moveStage', () => {
    it('sollte erfolgreich eine Stage in einen anderen Workflow verschieben', async () => {
      const stageId = 'stage-1';
      const moveDto = {
        workflowId: 'new-workflow-id',
        order: 2
      };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);
      mockPrismaService.workflow.findUnique.mockResolvedValue({
        ...mockWorkflow,
        id: 'new-workflow-id'
      });
      mockPrismaService.workflowStage.update.mockResolvedValue({
        ...mockWorkflowStage,
        ...moveDto
      });

      const result = await service.moveStage(stageId, moveDto);

      expect(result).toEqual({
        ...mockWorkflowStage,
        ...moveDto
      });
      expect(mockPrismaService.workflowStage.update).toHaveBeenCalledWith({
        where: { id: stageId },
        data: moveDto,
        include: {
          workflow: true,
          tasks: {
            include: {
              assignee: true
            },
            orderBy: {}
          }
        }
      });
    });

    it('sollte NotFoundException werfen wenn Stage nicht existiert', async () => {
      const stageId = 'non-existent-stage';
      const moveDto = { workflowId: 'new-workflow-id', order: 1 };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(null);

      await expect(service.moveStage(stageId, moveDto)).rejects.toThrow(
        new NotFoundException(`Workflow stage with ID ${stageId} not found`)
      );
    });

    it('sollte NotFoundException werfen wenn neuer Workflow nicht existiert', async () => {
      const stageId = 'stage-1';
      const moveDto = {
        workflowId: 'non-existent-workflow',
        order: 1
      };

      mockPrismaService.workflowStage.findUnique.mockResolvedValue(mockWorkflowStage);
      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.moveStage(stageId, moveDto)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${moveDto.workflowId} not found`)
      );
    });
  });
});
