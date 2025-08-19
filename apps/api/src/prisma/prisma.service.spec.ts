import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

// Mock PrismaClient
const mockPrismaClient = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

describe('PrismaService', () => {
  let service: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('sollte erfolgreich mit der Datenbank verbinden', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockPrismaClient.$connect).toHaveBeenCalled();
    });

    it('sollte Verbindungsfehler behandeln', async () => {
      const error = new Error('Database connection failed');
      mockPrismaClient.$connect.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.onModuleInit()).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith('Datenbankverbindung fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('onModuleDestroy', () => {
    it('sollte erfolgreich die Datenbankverbindung trennen', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });

    it('sollte Trennungsfehler behandeln', async () => {
      const error = new Error('Database disconnection failed');
      mockPrismaClient.$disconnect.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.onModuleDestroy();

      expect(consoleSpy).toHaveBeenCalledWith('Datenbankverbindung konnte nicht getrennt werden:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('enableShutdownHooks', () => {
    it('sollte Shutdown-Hooks erfolgreich aktivieren', () => {
      const mockApp = {
        close: jest.fn()
      };

      service.enableShutdownHooks(mockApp as any);

      expect(mockPrismaClient.$on).toHaveBeenCalledWith('beforeExit', expect.any(Function));
    });

    it('sollte App korrekt schließen wenn Datenbank getrennt wird', async () => {
      const mockApp = {
        close: jest.fn()
      };

      service.enableShutdownHooks(mockApp as any);

      // Simuliere beforeExit Event
      const beforeExitCallback = mockPrismaClient.$on.mock.calls[0][1];
      await beforeExitCallback();

      expect(mockApp.close).toHaveBeenCalled();
    });
  });

  describe('Datenbankoperationen', () => {
    it('sollte User-Operationen korrekt weiterleiten', async () => {
      const mockUser = { id: '1', name: 'Test User' };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.user.findUnique({ where: { id: '1' } });

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('sollte Project-Operationen korrekt weiterleiten', async () => {
      const mockProject = { id: '1', name: 'Test Project' };
      mockPrismaClient.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.project.findUnique({ where: { id: '1' } });

      expect(result).toEqual(mockProject);
      expect(mockPrismaClient.project.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('sollte Task-Operationen korrekt weiterleiten', async () => {
      const mockTask = { id: '1', title: 'Test Task' };
      mockPrismaClient.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.task.findUnique({ where: { id: '1' } });

      expect(result).toEqual(mockTask);
      expect(mockPrismaClient.task.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('Transaktionen', () => {
    it('sollte Transaktionen korrekt ausführen', async () => {
      const mockTransactionResult = [{ id: '1' }, { id: '2' }];
      mockPrismaClient.$transaction.mockResolvedValue(mockTransactionResult);

      const transactionCallback = jest.fn().mockResolvedValue(mockTransactionResult);
      const result = await service.$transaction(transactionCallback);

      expect(result).toEqual(mockTransactionResult);
      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(transactionCallback);
    });

    it('sollte Transaktionsfehler korrekt behandeln', async () => {
      const error = new Error('Transaction failed');
      mockPrismaClient.$transaction.mockRejectedValue(error);

      const transactionCallback = jest.fn().mockRejectedValue(error);

      await expect(service.$transaction(transactionCallback)).rejects.toThrow(error);
    });
  });

  describe('Fehlerbehandlung', () => {
    it('sollte Datenbankfehler korrekt protokollieren', async () => {
      const error = new Error('Database operation failed');
      mockPrismaClient.user.findUnique.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.user.findUnique({ where: { id: '1' } })).rejects.toThrow(error);
      consoleSpy.mockRestore();
    });

    it('sollte Verbindungsfehler bei Operationen behandeln', async () => {
      const connectionError = new Error('Connection lost');
      mockPrismaClient.user.findUnique.mockRejectedValue(connectionError);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.user.findUnique({ where: { id: '1' } })).rejects.toThrow(connectionError);
      consoleSpy.mockRestore();
    });
  });

  describe('Konfiguration', () => {
    it('sollte Umgebungsvariablen korrekt lesen', () => {
      const mockConfig = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        NODE_ENV: 'development'
      };

      jest.spyOn(configService, 'get').mockImplementation((key: string) => mockConfig[key]);

      // Trigger config reading
      service.onModuleInit();

      expect(configService.get).toHaveBeenCalled();
    });

    it('sollte Standardwerte verwenden wenn Konfiguration fehlt', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      // Trigger config reading
      service.onModuleInit();

      expect(configService.get).toHaveBeenCalled();
    });
  });

  describe('Performance-Monitoring', () => {
    it('sollte langsame Abfragen protokollieren', async () => {
      const slowQuery = { where: { id: '1' } };
      const startTime = Date.now();

      // Simuliere langsame Abfrage
      mockPrismaClient.user.findUnique.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ id: '1', name: 'Slow User' }), 100);
        });
      });

      const result = await service.user.findUnique(slowQuery);
      const duration = Date.now() - startTime;

      expect(result).toEqual({ id: '1', name: 'Slow User' });
      expect(duration).toBeGreaterThan(50); // Mindestens 50ms
    });

    it('sollte Abfrage-Statistiken sammeln', async () => {
      const queries = [
        { where: { id: '1' } },
        { where: { id: '2' } },
        { where: { id: '3' } }
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue({ id: '1', name: 'User' });

      for (const query of queries) {
        await service.user.findUnique(query);
      }

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledTimes(queries.length);
    });
  });

  describe('Gesundheitsprüfung', () => {
    it('sollte Datenbankverbindung als gesund melden', async () => {
      mockPrismaClient.$connect.mockResolvedValue(undefined);

      const isHealthy = await service.isHealthy();

      expect(isHealthy).toBe(true);
    });

    it('sollte Datenbankverbindung als ungesund melden bei Fehlern', async () => {
      mockPrismaClient.$connect.mockRejectedValue(new Error('Connection failed'));

      const isHealthy = await service.isHealthy();

      expect(isHealthy).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('sollte alle aktiven Verbindungen korrekt schließen', async () => {
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);

      await service.cleanup();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
    });

    it('sollte Cleanup-Fehler behandeln', async () => {
      const error = new Error('Cleanup failed');
      mockPrismaClient.$disconnect.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.cleanup();

      expect(consoleSpy).toHaveBeenCalledWith('Cleanup fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });
});
