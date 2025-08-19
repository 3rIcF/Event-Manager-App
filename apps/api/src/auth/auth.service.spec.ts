import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { 
  mockPrismaService, 
  mockJwtService, 
  mockConfigService, 
  mockEmailService,
  mockUser,
  resetAllMocks
} from '../test-utils/test-utils';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: EmailService,
          useValue: mockEmailService
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);

    resetAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('validateUser', () => {
    it('sollte einen gültigen Benutzer erfolgreich validieren', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword
      });
      mockBcrypt.compare.mockResolvedValue(true as any);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { 
          email: email.toLowerCase(),
          isActive: true
        }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('sollte null zurückgeben wenn E-Mail fehlt', async () => {
      const result = await service.validateUser('', 'password123');
      expect(result).toBeNull();
    });

    it('sollte null zurückgeben wenn Passwort fehlt', async () => {
      const result = await service.validateUser('test@example.com', '');
      expect(result).toBeNull();
    });

    it('sollte null zurückgeben wenn Benutzer nicht gefunden wird', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('sollte null zurückgeben wenn Passwort nicht übereinstimmt', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword
      });
      mockBcrypt.compare.mockResolvedValue(false as any);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('sollte null zurückgeben bei Datenbankfehlern', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('sollte erfolgreich einen Benutzer anmelden', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: mockUser,
        ...mockTokens
      });
      expect(service.validateUser).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(service.generateTokens).toHaveBeenCalledWith(mockUser);
    });

    it('sollte BadRequestException werfen wenn E-Mail fehlt', async () => {
      const loginDto = {
        email: '',
        password: 'password123'
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('sollte BadRequestException werfen wenn Passwort fehlt', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: ''
      };

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('sollte UnauthorizedException werfen bei ungültigen Anmeldedaten', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('sollte UnauthorizedException werfen bei deaktiviertem Account', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(service, 'validateUser').mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('sollte UnauthorizedException werfen bei anderen Fehlern', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      jest.spyOn(service, 'validateUser').mockRejectedValue(new Error('Unknown error'));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('sollte erfolgreich einen neuen Benutzer registrieren', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'New User',
        role: 'USER' as const
      };

      const hashedPassword = 'hashedPassword123';
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('12');
      mockBcrypt.hash.mockResolvedValue(hashedPassword as any);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
        passwordHash: hashedPassword
      });
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
      expect(result.user.role).toBe(registerDto.role);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email.toLowerCase(),
          name: registerDto.name,
          role: registerDto.role,
          passwordHash: hashedPassword,
          isActive: true
        }
      });
    });

    it('sollte BadRequestException werfen wenn erforderliche Felder fehlen', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: '',
        role: 'USER' as const
      };

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('sollte BadRequestException werfen wenn Passwörter nicht übereinstimmen', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'different',
        name: 'New User',
        role: 'USER' as const
      };

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('sollte BadRequestException werfen wenn E-Mail bereits existiert', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        name: 'New User',
        role: 'USER' as const
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateTokens', () => {
    it('sollte Access- und Refresh-Token generieren', async () => {
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockJwtService.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);

      const result = await service.generateTokens(mockUser);

      expect(result).toEqual(mockTokens);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    it('sollte erfolgreich einen Token erneuern', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual(mockTokens);
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
    });

    it('sollte UnauthorizedException werfen bei ungültigem Token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('sollte UnauthorizedException werfen wenn Benutzer nicht gefunden wird', async () => {
      const refreshToken = 'valid-refresh-token';

      mockJwtService.verify.mockReturnValue({ sub: 'non-existent-user' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('sollte Token zur Blacklist hinzufügen', async () => {
      const accessToken = 'access-token-to-blacklist';

      await service.logout(accessToken);

      expect(service['tokenBlacklist'].has(accessToken)).toBe(true);
    });
  });

  describe('isTokenBlacklisted', () => {
    it('sollte true zurückgeben für blacklistete Token', async () => {
      const accessToken = 'blacklisted-token';
      service['tokenBlacklist'].add(accessToken);

      const result = await service.isTokenBlacklisted(accessToken);

      expect(result).toBe(true);
    });

    it('sollte false zurückgeben für nicht-blacklistete Token', async () => {
      const accessToken = 'valid-token';

      const result = await service.isTokenBlacklisted(accessToken);

      expect(result).toBe(false);
    });
  });

  describe('sendMagicLink', () => {
    it('sollte erfolgreich einen Magic Link senden', async () => {
      const magicLinkDto = {
        email: 'test@example.com'
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockEmailService.sendMagicLink.mockResolvedValue(undefined);

      const result = await service.sendMagicLink(magicLinkDto);

      expect(result).toBe(true);
      expect(mockEmailService.sendMagicLink).toHaveBeenCalledWith(mockUser.email);
    });

    it('sollte false zurückgeben wenn Benutzer nicht gefunden wird', async () => {
      const magicLinkDto = {
        email: 'nonexistent@example.com'
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.sendMagicLink(magicLinkDto);

      expect(result).toBe(false);
      expect(mockEmailService.sendMagicLink).not.toHaveBeenCalled();
    });
  });

  describe('validateMagicLink', () => {
    it('sollte erfolgreich einen Magic Link validieren', async () => {
      const token = 'valid-magic-link-token';
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(service, 'generateTokens').mockResolvedValue(mockTokens);

      const result = await service.validateMagicLink(token);

      expect(result).toEqual({
        user: mockUser,
        ...mockTokens
      });
    });

    it('sollte UnauthorizedException werfen bei ungültigem Token', async () => {
      const token = 'invalid-magic-link-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateMagicLink(token)).rejects.toThrow(UnauthorizedException);
    });
  });
});
