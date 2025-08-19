import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { PrismaService } from '../prisma/prisma.service';
import { 
  mockPrismaService, 
  mockWorkflow, 
  mockProject,
  generateMockWorkflows,
  resetAllMocks
} from '../test-utils/test-utils';

describe('WorkflowsService', () => {
  let service: WorkflowsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    it('sollte erfolgreich einen neuen Workflow erstellen', async () => {
      const createDto = {
        name: 'Test Workflow',
        description: 'Test Description',
        projectId: 'project-1'
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.workflow.create.mockResolvedValue({
        ...mockWorkflow,
        ...createDto
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockWorkflow,
        ...createDto
      });
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.projectId }
      });
    });

    it('sollte erfolgreich einen Workflow ohne Projekt erstellen', async () => {
      const createDto = {
        name: 'Test Workflow',
        description: 'Test Description'
      };

      mockPrismaService.workflow.create.mockResolvedValue({
        ...mockWorkflow,
        ...createDto,
        projectId: null
      });

      const result = await service.create(createDto);

      expect(result).toEqual({
        ...mockWorkflow,
        ...createDto,
        projectId: null
      });
      expect(mockPrismaService.project.findUnique).not.toHaveBeenCalled();
    });

    it('sollte NotFoundException werfen wenn Projekt nicht existiert', async () => {
      const createDto = {
        name: 'Test Workflow',
        description: 'Test Description',
        projectId: 'non-existent-project'
      };

      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Project with ID ${createDto.projectId} not found`)
      );
    });

    it('sollte automatisch den Status ACTIVE setzen wenn nicht angegeben', async () => {
      const createDto = {
        name: 'Test Workflow',
        description: 'Test Description',
        projectId: 'project-1'
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.workflow.create.mockResolvedValue({
        ...mockWorkflow,
        ...createDto,
        status: 'ACTIVE'
      });

      const result = await service.create(createDto);

      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('findAll', () => {
    it('sollte alle Workflows zurückgeben', async () => {
      const mockWorkflows = generateMockWorkflows(3);
      mockPrismaService.workflow.findMany.mockResolvedValue(mockWorkflows);

      const result = await service.findAll();

      expect(result).toEqual(mockWorkflows);
    });

    it('sollte Workflows für ein spezifisches Projekt zurückgeben', async () => {
      const projectId = 'project-1';
      const mockWorkflows = generateMockWorkflows(2);
      mockPrismaService.workflow.findMany.mockResolvedValue(mockWorkflows);

      const result = await service.findAll(projectId);

      expect(result).toEqual(mockWorkflows);
    });

    it('sollte Workflows nach Erstellungsdatum sortiert zurückgeben', async () => {
      const mockWorkflows = generateMockWorkflows(3);
      mockPrismaService.workflow.findMany.mockResolvedValue(mockWorkflows);

      await service.findAll();

      expect(mockPrismaService.workflow.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          project: true,
          stages: {
            orderBy: { order: 'asc' }
          },
          tasks: true
        },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('findOne', () => {
    it('sollte einen spezifischen Workflow zurückgeben', async () => {
      const workflowId = 'workflow-1';
      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);

      const result = await service.findOne(workflowId);

      expect(result).toEqual(mockWorkflow);
    });

    it('sollte NotFoundException werfen wenn Workflow nicht gefunden wird', async () => {
      const workflowId = 'non-existent-workflow';
      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.findOne(workflowId)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${workflowId} not found`)
      );
    });

    it('sollte Workflow mit Stages und Tasks zurückgeben', async () => {
      const workflowId = 'workflow-1';
      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);

      await service.findOne(workflowId);

      expect(mockPrismaService.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: workflowId },
        include: {
          project: true,
          stages: {
            orderBy: { order: 'asc' }
          },
          tasks: {
            include: {
              assignee: true
            }
          }
        }
      });
    });
  });

  describe('update', () => {
    it('sollte erfolgreich einen Workflow aktualisieren', async () => {
      const workflowId = 'workflow-1';
      const updateDto = {
        name: 'Updated Workflow',
        description: 'Updated Description'
      };

      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.workflow.update.mockResolvedValue({
        ...mockWorkflow,
        ...updateDto
      });

      const result = await service.update(workflowId, updateDto);

      expect(result).toEqual({
        ...mockWorkflow,
        ...updateDto
      });
    });

    it('sollte NotFoundException werfen wenn Workflow nicht existiert', async () => {
      const workflowId = 'non-existent-workflow';
      const updateDto = { name: 'Updated Workflow' };

      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.update(workflowId, updateDto)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${updateDto.projectId} not found`)
      );
    });

    it('sollte erfolgreich einen Workflow mit Projekt-Änderung aktualisieren', async () => {
      const workflowId = 'workflow-1';
      const updateDto = {
        name: 'Updated Workflow',
        projectId: 'new-project-id'
      };

      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.project.findUnique.mockResolvedValue({
        ...mockProject,
        id: 'new-project-id'
      });
      mockPrismaService.workflow.update.mockResolvedValue({
        ...mockWorkflow,
        ...updateDto
      });

      const result = await service.update(workflowId, updateDto);

      expect(result).toEqual({
        ...mockWorkflow,
        ...updateDto
      });
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: updateDto.projectId }
      });
    });

    it('sollte NotFoundException werfen wenn neues Projekt nicht existiert', async () => {
      const workflowId = 'workflow-1';
      const updateDto = {
        name: 'Updated Workflow',
        projectId: 'non-existent-project'
      };

      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.update(workflowId, updateDto)).rejects.toThrow(
        new NotFoundException(`Project with ID ${updateDto.projectId} not found`)
      );
    });
  });

  describe('remove', () => {
    it('sollte erfolgreich einen Workflow löschen', async () => {
      const workflowId = 'workflow-1';
      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.workflow.delete.mockResolvedValue(mockWorkflow);

      const result = await service.remove(workflowId);

      expect(result).toEqual(mockWorkflow);
    });

    it('sollte NotFoundException werfen wenn Workflow nicht existiert', async () => {
      const workflowId = 'non-existent-workflow';
      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.remove(workflowId)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${workflowId} not found`)
      );
    });
  });

  describe('findByProject', () => {
    it('sollte alle Workflows für ein spezifisches Projekt zurückgeben', async () => {
      const projectId = 'project-1';
      const mockWorkflows = generateMockWorkflows(3);
      mockPrismaService.workflow.findMany.mockResolvedValue(mockWorkflows);

      const result = await service.findByProject(projectId);

      expect(result).toEqual(mockWorkflows);
      expect(mockPrismaService.workflow.findMany).toHaveBeenCalledWith({
        where: { projectId },
        include: {
          project: true,
          stages: {
            orderBy: { order: 'asc' }
          },
          tasks: true
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Workflows für Projekt gefunden werden', async () => {
      const projectId = 'project-1';
      mockPrismaService.workflow.findMany.mockResolvedValue([]);

      const result = await service.findByProject(projectId);

      expect(result).toEqual([]);
    });
  });

  describe('activateWorkflow', () => {
    it('sollte erfolgreich einen Workflow aktivieren', async () => {
      const workflowId = 'workflow-1';
      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.workflow.update.mockResolvedValue({
        ...mockWorkflow,
        status: 'ACTIVE'
      });

      const result = await service.activateWorkflow(workflowId);

      expect(result.status).toBe('ACTIVE');
      expect(mockPrismaService.workflow.update).toHaveBeenCalledWith({
        where: { id: workflowId },
        data: { status: 'ACTIVE' },
        include: {
          project: true,
          stages: {
            orderBy: { order: 'asc' }
          },
          tasks: {
            include: {
              assignee: true
            }
          }
        }
      });
    });

    it('sollte NotFoundException werfen wenn Workflow nicht existiert', async () => {
      const workflowId = 'non-existent-workflow';
      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.activateWorkflow(workflowId)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${workflowId} not found`)
      );
    });
  });

  describe('deactivateWorkflow', () => {
    it('sollte erfolgreich einen Workflow deaktivieren', async () => {
      const workflowId = 'workflow-1';
      mockPrismaService.workflow.findUnique.mockResolvedValue(mockWorkflow);
      mockPrismaService.workflow.update.mockResolvedValue({
        ...mockWorkflow,
        status: 'INACTIVE'
      });

      const result = await service.deactivateWorkflow(workflowId);

      expect(result.status).toBe('INACTIVE');
      expect(mockPrismaService.workflow.update).toHaveBeenCalledWith({
        where: { id: workflowId },
        data: { status: 'INACTIVE' },
        include: {
          project: true,
          stages: {
            orderBy: { order: 'asc' }
          },
          tasks: {
            include: {
              assignee: true
            }
          }
        }
      });
    });

    it('sollte NotFoundException werfen wenn Workflow nicht existiert', async () => {
      const workflowId = 'non-existent-workflow';
      mockPrismaService.workflow.findUnique.mockResolvedValue(null);

      await expect(service.deactivateWorkflow(workflowId)).rejects.toThrow(
        new NotFoundException(`Workflow with ID ${workflowId} not found`)
      );
    });
  });
});
