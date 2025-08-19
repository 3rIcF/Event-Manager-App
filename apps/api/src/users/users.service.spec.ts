import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  mockPrismaService, 
  mockUser, 
  generateMockUsers,
  resetAllMocks
} from '../test-utils/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('findAll', () => {
    it('sollte alle Benutzer erfolgreich abrufen', async () => {
      const mockUsers = generateMockUsers(3);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Benutzer existieren', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('sollte Datenbankfehler weiterleiten', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.user.findMany.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('sollte einen Benutzer anhand der ID erfolgreich finden', async () => {
      const userId = 'user-1';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte NotFoundException werfen wenn Benutzer nicht gefunden wird', async () => {
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte Datenbankfehler weiterleiten', async () => {
      const userId = 'user-1';
      const error = new Error('Database error');
      mockPrismaService.user.findUnique.mockRejectedValue(error);

      await expect(service.findById(userId)).rejects.toThrow(error);
    });
  });

  describe('findByEmail', () => {
    it('sollte einen Benutzer anhand der E-Mail erfolgreich finden', async () => {
      const email = 'test@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte null zurückgeben wenn Benutzer nicht gefunden wird', async () => {
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });

    it('sollte E-Mail-Adresse in Kleinbuchstaben konvertieren', async () => {
      const email = 'TEST@EXAMPLE.COM';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await service.findByEmail(email);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });
  });

  describe('create', () => {
    it('sollte erfolgreich einen neuen Benutzer erstellen', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'New User',
        role: 'USER' as const
      };

      const createdUser = { ...mockUser, ...userData };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email.toLowerCase() }
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email.toLowerCase(),
          name: userData.name,
          role: userData.role,
          passwordHash: 'temporary',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte BadRequestException werfen wenn E-Mail bereits existiert', async () => {
      const userData = {
        email: 'existing@example.com',
        name: 'New User',
        role: 'USER' as const
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(userData)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('sollte E-Mail-Adresse in Kleinbuchstaben konvertieren', async () => {
      const userData = {
        email: 'NEW@EXAMPLE.COM',
        name: 'New User',
        role: 'USER' as const
      };

      const createdUser = { ...mockUser, ...userData, email: userData.email.toLowerCase() };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      await service.create(userData);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email.toLowerCase(),
          name: userData.name,
          role: userData.role,
          passwordHash: 'temporary',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte Standardrolle USER verwenden wenn keine Rolle angegeben wird', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'New User'
      };

      const createdUser = { ...mockUser, ...userData, role: 'USER' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      await service.create(userData);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email.toLowerCase(),
          name: userData.name,
          role: 'USER',
          passwordHash: 'temporary',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });
  });

  describe('update', () => {
    it('sollte erfolgreich einen Benutzer aktualisieren', async () => {
      const userId = 'user-1';
      const updateData = {
        name: 'Updated Name',
        role: 'ADMIN' as const
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte NotFoundException werfen wenn Benutzer nicht existiert', async () => {
      const userId = 'non-existent-user';
      const updateData = { name: 'Updated Name' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, updateData)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('sollte nur angegebene Felder aktualisieren', async () => {
      const userId = 'user-1';
      const updateData = { name: 'Updated Name' };

      const updatedUser = { ...mockUser, name: updateData.name };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await service.update(userId, updateData);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });
  });

  describe('delete', () => {
    it('sollte erfolgreich einen Benutzer löschen', async () => {
      const userId = 'user-1';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId }
      });
    });

    it('sollte NotFoundException werfen wenn Benutzer nicht existiert', async () => {
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('sollte die Gesamtanzahl der Benutzer zurückgeben', async () => {
      const userCount = 5;
      mockPrismaService.user.count.mockResolvedValue(userCount);

      const result = await service.count();

      expect(result).toBe(userCount);
      expect(mockPrismaService.user.count).toHaveBeenCalled();
    });

    it('sollte 0 zurückgeben wenn keine Benutzer existieren', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);

      const result = await service.count();

      expect(result).toBe(0);
    });
  });

  describe('findByRole', () => {
    it('sollte alle Benutzer mit einer bestimmten Rolle finden', async () => {
      const role = 'ADMIN';
      const adminUsers = generateMockUsers(2).map(user => ({ ...user, role: 'ADMIN' }));
      mockPrismaService.user.findMany.mockResolvedValue(adminUsers);

      const result = await service.findByRole(role);

      expect(result).toEqual(adminUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte leeres Array zurückgeben wenn keine Benutzer mit der Rolle existieren', async () => {
      const role = 'SUPER_ADMIN';
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findByRole(role);

      expect(result).toEqual([]);
    });
  });

  describe('deactivate', () => {
    it('sollte erfolgreich einen Benutzer deaktivieren', async () => {
      const userId = 'user-1';
      const deactivatedUser = { ...mockUser, isActive: false };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(deactivatedUser);

      const result = await service.deactivate(userId);

      expect(result).toEqual(deactivatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte NotFoundException werfen wenn Benutzer nicht existiert', async () => {
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deactivate(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('activate', () => {
    it('sollte erfolgreich einen Benutzer aktivieren', async () => {
      const userId = 'user-1';
      const activatedUser = { ...mockUser, isActive: true };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(activatedUser);

      const result = await service.activate(userId);

      expect(result).toEqual(activatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('sollte NotFoundException werfen wenn Benutzer nicht existiert', async () => {
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.activate(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
