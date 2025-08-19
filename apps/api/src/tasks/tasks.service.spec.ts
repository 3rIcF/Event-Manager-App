import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  mockPrismaService, 
  mockTask, 
  mockUser,
  mockProject,
  generateMockTasks,
  resetAllMocks
} from '../test-utils/test-utils';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    const validCreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      projectId: 'project-1',
      assigneeId: 'user-1',
      dueDate: new Date('2024-12-31'),
      estimatedHours: 8
    };

    it('sollte erfolgreich eine neue Aufgabe erstellen', async () => {
      const createdTask = { ...mockTask, ...validCreateTaskDto };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.task.create.mockResolvedValue(createdTask);

      const result = await service.create(validCreateTaskDto);

      expect(result).toEqual(createdTask);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateTaskDto.projectId }
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateTaskDto.assigneeId }
      });
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: {
          title: validCreateTaskDto.title,
          description: validCreateTaskDto.description,
          status: validCreateTaskDto.status,
          priority: validCreateTaskDto.priority,
          projectId: validCreateTaskDto.projectId,
          assigneeId: validCreateTaskDto.assigneeId,
          dueDate: validCreateTaskDto.dueDate,
          estimatedHours: validCreateTaskDto.estimatedHours
        }
      });
    });

    it('sollte BadRequestException werfen wenn Titel fehlt', async () => {
      const invalidDto = { ...validCreateTaskDto, title: '' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Projekt nicht existiert', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.create(validCreateTaskDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Zuweisener nicht existiert', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(validCreateTaskDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Fälligkeitsdatum in der Vergangenheit liegt', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidDto = { ...validCreateTaskDto, dueDate: yesterday };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen bei negativen geschätzten Stunden', async () => {
      const invalidDto = { ...validCreateTaskDto, estimatedHours: -5 };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('sollte alle Aufgaben erfolgreich abrufen', async () => {
      const mockTasks = generateMockTasks(3);
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll();

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          dependencies: {
            include: {
              dependentTask: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Aufgaben existieren', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('sollte eine Aufgabe anhand der ID erfolgreich finden', async () => {
      const taskId = 'task-1';
      const taskWithDetails = {
        ...mockTask,
        project: mockProject,
        assignee: mockUser,
        dependencies: []
      };
      mockPrismaService.task.findUnique.mockResolvedValue(taskWithDetails);

      const result = await service.findById(taskId);

      expect(result).toEqual(taskWithDetails);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          dependencies: {
            include: {
              dependentTask: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              createdAt: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    });

    it('sollte NotFoundException werfen wenn Aufgabe nicht gefunden wird', async () => {
      const taskId = 'non-existent-task';
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findById(taskId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProject', () => {
    it('sollte alle Aufgaben eines Projekts abrufen', async () => {
      const projectId = 'project-1';
      const mockTasks = generateMockTasks(2);
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findByProject(projectId);

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { projectId },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          dependencies: {
            include: {
              dependentTask: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          }
        },
        orderBy: {
          priority: 'desc',
          dueDate: 'asc'
        }
      });
    });
  });

  describe('findByAssignee', () => {
    it('sollte alle Aufgaben eines Zuweiseners abrufen', async () => {
      const assigneeId = 'user-1';
      const mockTasks = generateMockTasks(3);
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findByAssignee(assigneeId);

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { assigneeId },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          priority: 'desc',
          dueDate: 'asc'
        }
      });
    });
  });

  describe('update', () => {
    it('sollte erfolgreich eine Aufgabe aktualisieren', async () => {
      const taskId = 'task-1';
      const updateData = {
        title: 'Updated Task Title',
        status: 'IN_PROGRESS'
      };

      const updatedTask = { ...mockTask, ...updateData };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update(taskId, updateData);

      expect(result).toEqual(updatedTask);
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData
      });
    });

    it('sollte NotFoundException werfen wenn Aufgabe nicht existiert', async () => {
      const taskId = 'non-existent-task';
      const updateData = { title: 'Updated Title' };

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.update(taskId, updateData)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });

    it('sollte Validierung für Fälligkeitsdatum durchführen', async () => {
      const taskId = 'task-1';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidUpdateData = { dueDate: yesterday };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.update(taskId, invalidUpdateData)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('sollte erfolgreich eine Aufgabe löschen', async () => {
      const taskId = 'task-1';
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      const result = await service.delete(taskId);

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskId }
      });
    });

    it('sollte NotFoundException werfen wenn Aufgabe nicht existiert', async () => {
      const taskId = 'non-existent-task';
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.delete(taskId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.delete).not.toHaveBeenCalled();
    });
  });

  describe('changeStatus', () => {
    it('sollte erfolgreich den Status einer Aufgabe ändern', async () => {
      const taskId = 'task-1';
      const newStatus = 'IN_PROGRESS';
      const updatedTask = { ...mockTask, status: newStatus };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.changeStatus(taskId, newStatus);

      expect(result).toEqual(updatedTask);
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { status: newStatus }
      });
    });

    it('sollte NotFoundException werfen wenn Aufgabe nicht existiert', async () => {
      const taskId = 'non-existent-task';
      const newStatus = 'IN_PROGRESS';

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.changeStatus(taskId, newStatus)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen bei ungültigem Status', async () => {
      const taskId = 'task-1';
      const invalidStatus = 'INVALID_STATUS';

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.changeStatus(taskId, invalidStatus)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('assignTask', () => {
    it('sollte erfolgreich eine Aufgabe einem Benutzer zuweisen', async () => {
      const taskId = 'task-1';
      const assigneeId = 'user-2';
      const updatedTask = { ...mockTask, assigneeId };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.assignTask(taskId, assigneeId);

      expect(result).toEqual(updatedTask);
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { assigneeId }
      });
    });

    it('sollte NotFoundException werfen wenn Aufgabe nicht existiert', async () => {
      const taskId = 'non-existent-task';
      const assigneeId = 'user-2';

      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.assignTask(taskId, assigneeId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Zuweisener nicht existiert', async () => {
      const taskId = 'task-1';
      const assigneeId = 'non-existent-user';

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.assignTask(taskId, assigneeId)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('getTaskStats', () => {
    it('sollte Aufgabenstatistiken zurückgeben', async () => {
      const projectId = 'project-1';
      const mockStats = {
        total: 10,
        todo: 3,
        inProgress: 4,
        completed: 2,
        cancelled: 1
      };

      mockPrismaService.task.count.mockResolvedValue(mockStats.total);
      mockPrismaService.task.count.mockResolvedValueOnce(mockStats.todo);
      mockPrismaService.task.count.mockResolvedValueOnce(mockStats.inProgress);
      mockPrismaService.task.count.mockResolvedValueOnce(mockStats.completed);
      mockPrismaService.task.count.mockResolvedValueOnce(mockStats.cancelled);

      const result = await service.getTaskStats(projectId);

      expect(result).toEqual(mockStats);
      expect(mockPrismaService.task.count).toHaveBeenCalledTimes(5);
    });
  });

  describe('searchTasks', () => {
    it('sollte Aufgaben nach Suchbegriff durchsuchen', async () => {
      const searchTerm = 'test';
      const mockTasks = generateMockTasks(2);
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.searchTasks(searchTerm);

      expect(result).toEqual(mockTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });
  });

  describe('getOverdueTasks', () => {
    it('sollte überfällige Aufgaben zurückgeben', async () => {
      const mockOverdueTasks = generateMockTasks(2);
      mockPrismaService.task.findMany.mockResolvedValue(mockOverdueTasks);

      const result = await service.getOverdueTasks();

      expect(result).toEqual(mockOverdueTasks);
      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          dueDate: {
            lt: expect.any(Date)
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      });
    });
  });
});
