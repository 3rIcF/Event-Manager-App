import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  mockPrismaService, 
  mockProject, 
  mockUser,
  generateMockProjects,
  resetAllMocks
} from '../test-utils/test-utils';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('create', () => {
    const validCreateProjectDto = {
      name: 'Test Project',
      dateFrom: new Date('2024-02-01'),
      dateTo: new Date('2024-02-28'),
      locationName: 'Test Location',
      address: 'Test Address',
      lat: 52.5200,
      lng: 13.4050,
      budgetEstimate: 10000,
      ownerId: 'user-1'
    };

    it('sollte erfolgreich ein neues Projekt erstellen', async () => {
      const createdProject = { ...mockProject, ...validCreateProjectDto };
      mockPrismaService.project.create.mockResolvedValue(createdProject);

      const result = await service.create(validCreateProjectDto);

      expect(result).toEqual(createdProject);
      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          name: validCreateProjectDto.name,
          startDate: validCreateProjectDto.dateFrom,
          dateFrom: validCreateProjectDto.dateFrom,
          dateTo: validCreateProjectDto.dateTo,
          locationName: validCreateProjectDto.locationName,
          address: validCreateProjectDto.address,
          lat: validCreateProjectDto.lat,
          lng: validCreateProjectDto.lng,
          budgetEstimate: validCreateProjectDto.budgetEstimate,
          status: 'PLANNING',
          owner: {
            connect: { id: validCreateProjectDto.ownerId }
          }
        }
      });
    });

    it('sollte BadRequestException werfen wenn Name fehlt', async () => {
      const invalidDto = { ...validCreateProjectDto, name: '' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn dateFrom fehlt', async () => {
      const invalidDto = { ...validCreateProjectDto, dateFrom: undefined };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn dateTo fehlt', async () => {
      const invalidDto = { ...validCreateProjectDto, dateTo: undefined };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn locationName fehlt', async () => {
      const invalidDto = { ...validCreateProjectDto, locationName: '' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn ownerId fehlt', async () => {
      const invalidDto = { ...validCreateProjectDto, ownerId: '' };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Enddatum vor Startdatum liegt', async () => {
      const invalidDto = {
        ...validCreateProjectDto,
        dateFrom: new Date('2024-02-28'),
        dateTo: new Date('2024-02-01')
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Startdatum in der Vergangenheit liegt', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidDto = {
        ...validCreateProjectDto,
        dateFrom: yesterday,
        dateTo: new Date('2024-12-31')
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen bei ungültigem Breitengrad', async () => {
      const invalidDto = { ...validCreateProjectDto, lat: 100 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen bei ungültigem Längengrad', async () => {
      const invalidDto = { ...validCreateProjectDto, lng: 200 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen bei negativem Budget', async () => {
      const invalidDto = { ...validCreateProjectDto, budgetEstimate: -1000 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.create).not.toHaveBeenCalled();
    });

    it('sollte BadRequestException werfen wenn Datenbankfehler auftritt', async () => {
      mockPrismaService.project.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(validCreateProjectDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('sollte alle Projekte für einen Benutzer abrufen', async () => {
      const userId = 'user-1';
      const userRole = 'USER';
      const mockProjects = generateMockProjects(3);
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll(userId, userRole);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          suppliers: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true
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

    it('sollte BadRequestException werfen wenn userId fehlt', async () => {
      await expect(service.findAll('', 'USER')).rejects.toThrow(BadRequestException);
    });

    it('sollte BadRequestException werfen wenn userRole fehlt', async () => {
      await expect(service.findAll('user-1', '')).rejects.toThrow(BadRequestException);
    });

    it('sollte externe Lieferanten nur ihre zugewiesenen Projekte sehen', async () => {
      const userId = 'vendor-1';
      const userRole = 'EXTERNAL_VENDOR';
      const mockProjects = generateMockProjects(2);
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      await service.findAll(userId, userRole);

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          suppliers: {
            some: {
              supplier: {
                // Hier würden Sie die Lieferanten-ID des Users prüfen
              }
            }
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          suppliers: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true
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
  });

  describe('findById', () => {
    it('sollte ein Projekt anhand der ID erfolgreich finden', async () => {
      const projectId = 'project-1';
      const projectWithDetails = {
        ...mockProject,
        owner: mockUser,
        suppliers: []
      };
      mockPrismaService.project.findUnique.mockResolvedValue(projectWithDetails);

      const result = await service.findById(projectId);

      expect(result).toEqual(projectWithDetails);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          suppliers: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          tasks: {
            include: {
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
          }
        }
      });
    });

    it('sollte NotFoundException werfen wenn Projekt nicht gefunden wird', async () => {
      const projectId = 'non-existent-project';
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findById(projectId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('sollte erfolgreich ein Projekt aktualisieren', async () => {
      const projectId = 'project-1';
      const updateData = {
        name: 'Updated Project Name',
        status: 'IN_PROGRESS'
      };

      const updatedProject = { ...mockProject, ...updateData };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update(projectId, updateData);

      expect(result).toEqual(updatedProject);
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: updateData
      });
    });

    it('sollte NotFoundException werfen wenn Projekt nicht existiert', async () => {
      const projectId = 'non-existent-project';
      const updateData = { name: 'Updated Name' };

      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.update(projectId, updateData)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.project.update).not.toHaveBeenCalled();
    });

    it('sollte Datumsvalidierung durchführen', async () => {
      const projectId = 'project-1';
      const invalidUpdateData = {
        dateFrom: new Date('2024-02-28'),
        dateTo: new Date('2024-02-01')
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.update(projectId, invalidUpdateData)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.update).not.toHaveBeenCalled();
    });

    it('sollte Koordinatenvalidierung durchführen', async () => {
      const projectId = 'project-1';
      const invalidUpdateData = { lat: 100 };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.update(projectId, invalidUpdateData)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.project.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('sollte erfolgreich ein Projekt löschen', async () => {
      const projectId = 'project-1';
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.project.delete.mockResolvedValue(mockProject);

      const result = await service.delete(projectId);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
        where: { id: projectId }
      });
    });

    it('sollte NotFoundException werfen wenn Projekt nicht existiert', async () => {
      const projectId = 'non-existent-project';
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.delete(projectId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.project.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByStatus', () => {
    it('sollte Projekte nach Status filtern', async () => {
      const status = 'PLANNING';
      const mockProjects = generateMockProjects(2).map(p => ({ ...p, status }));
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findByStatus(status);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: { status },
        include: {
          owner: {
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

  describe('findByOwner', () => {
    it('sollte Projekte nach Besitzer filtern', async () => {
      const ownerId = 'user-1';
      const mockProjects = generateMockProjects(2);
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findByOwner(ownerId);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: { ownerId },
        include: {
          owner: {
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

  describe('getProjectStats', () => {
    it('sollte Projektstatistiken zurückgeben', async () => {
      const userId = 'user-1';
      const mockStats = {
        total: 10,
        planning: 3,
        inProgress: 4,
        completed: 2,
        cancelled: 1
      };

      mockPrismaService.project.count.mockResolvedValue(mockStats.total);
      mockPrismaService.project.count.mockResolvedValueOnce(mockStats.planning);
      mockPrismaService.project.count.mockResolvedValueOnce(mockStats.inProgress);
      mockPrismaService.project.count.mockResolvedValueOnce(mockStats.completed);
      mockPrismaService.project.count.mockResolvedValueOnce(mockStats.cancelled);

      const result = await service.getProjectStats(userId);

      expect(result).toEqual(mockStats);
      expect(mockPrismaService.project.count).toHaveBeenCalledTimes(5);
    });
  });

  describe('searchProjects', () => {
    it('sollte Projekte nach Suchbegriff durchsuchen', async () => {
      const searchTerm = 'test';
      const mockProjects = generateMockProjects(2);
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.searchProjects(searchTerm);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { locationName: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          owner: {
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
});
