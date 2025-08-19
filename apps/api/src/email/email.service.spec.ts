import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { 
  mockConfigService,
  mockUser,
  resetAllMocks
} from '../test-utils/test-utils';

// Mock nodemailer
const mockTransporter = {
  sendMail: jest.fn(),
  verify: jest.fn()
};

const mockCreateTransport = jest.fn(() => mockTransporter);

jest.mock('nodemailer', () => ({
  createTransport: mockCreateTransport
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    resetAllMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('sollte Transporter erfolgreich initialisieren', async () => {
      const mockConfig = {
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '587',
        SMTP_USER: 'test@example.com',
        SMTP_PASS: 'password123',
        SMTP_FROM: 'noreply@example.com'
      };

      mockConfigService.get.mockImplementation((key: string) => mockConfig[key]);

      await service.onModuleInit();

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: mockConfig.SMTP_HOST,
        port: parseInt(mockConfig.SMTP_PORT),
        secure: false,
        auth: {
          user: mockConfig.SMTP_USER,
          pass: mockConfig.SMTP_PASS
        }
      });
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('sollte Fehler bei der Transporter-Initialisierung behandeln', async () => {
      const error = new Error('SMTP connection failed');
      mockTransporter.verify.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await service.onModuleInit();

      expect(consoleSpy).toHaveBeenCalledWith('SMTP-Verbindung fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('sendEmail', () => {
    it('sollte E-Mail erfolgreich senden', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });
    });

    it('sollte false zurückgeben wenn E-Mail-Versand fehlschlägt', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendEmail(emailData);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('E-Mail-Versand fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });

    it('sollte Standard-Absender verwenden wenn nicht konfiguriert', async () => {
      const emailData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      mockConfigService.get.mockReturnValue(undefined);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      await service.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@elementaro.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });
    });
  });

  describe('sendMagicLink', () => {
    it('sollte Magic Link E-Mail erfolgreich senden', async () => {
      const email = 'user@example.com';
      const token = 'magic-link-token';
      const baseUrl = 'https://app.example.com';

      mockConfigService.get.mockReturnValue(baseUrl);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendMagicLink(email, token);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: email,
        subject: 'Ihr Magic Link für Elementaro',
        html: expect.stringContaining('Magic Link')
      });
    });

    it('sollte false zurückgeben wenn Magic Link E-Mail fehlschlägt', async () => {
      const email = 'user@example.com';
      const token = 'magic-link-token';

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendMagicLink(email, token);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Magic Link E-Mail fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('sendPasswordReset', () => {
    it('sollte Passwort-Reset E-Mail erfolgreich senden', async () => {
      const email = 'user@example.com';
      const resetToken = 'reset-token';
      const baseUrl = 'https://app.example.com';

      mockConfigService.get.mockReturnValue(baseUrl);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendPasswordReset(email, resetToken);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: email,
        subject: 'Passwort zurücksetzen - Elementaro',
        html: expect.stringContaining('Passwort zurücksetzen')
      });
    });

    it('sollte false zurückgeben wenn Passwort-Reset E-Mail fehlschlägt', async () => {
      const email = 'user@example.com';
      const resetToken = 'reset-token';

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendPasswordReset(email, resetToken);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Passwort-Reset E-Mail fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('sollte Willkommens-E-Mail erfolgreich senden', async () => {
      const user = { ...mockUser, name: 'Test User' };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendWelcomeEmail(user);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: user.email,
        subject: 'Willkommen bei Elementaro!',
        html: expect.stringContaining('Willkommen')
      });
    });

    it('sollte false zurückgeben wenn Willkommens-E-Mail fehlschlägt', async () => {
      const user = { ...mockUser, name: 'Test User' };

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendWelcomeEmail(user);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Willkommens-E-Mail fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('sendProjectInvitation', () => {
    it('sollte Projekt-Einladung erfolgreich senden', async () => {
      const invitationData = {
        email: 'invitee@example.com',
        projectName: 'Test Project',
        inviterName: 'Test Inviter',
        invitationUrl: 'https://app.example.com/invite/token'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendProjectInvitation(invitationData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: invitationData.email,
        subject: `Einladung zum Projekt: ${invitationData.projectName}`,
        html: expect.stringContaining('Einladung')
      });
    });

    it('sollte false zurückgeben wenn Projekt-Einladung fehlschlägt', async () => {
      const invitationData = {
        email: 'invitee@example.com',
        projectName: 'Test Project',
        inviterName: 'Test Inviter',
        invitationUrl: 'https://app.example.com/invite/token'
      };

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendProjectInvitation(invitationData);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Projekt-Einladung fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('sendTaskAssignment', () => {
    it('sollte Aufgaben-Zuweisung erfolgreich senden', async () => {
      const assignmentData = {
        email: 'assignee@example.com',
        taskTitle: 'Test Task',
        projectName: 'Test Project',
        assignerName: 'Test Assigner'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendTaskAssignment(assignmentData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: assignmentData.email,
        subject: `Neue Aufgabe zugewiesen: ${assignmentData.taskTitle}`,
        html: expect.stringContaining('Aufgabe zugewiesen')
      });
    });

    it('sollte false zurückgeben wenn Aufgaben-Zuweisung fehlschlägt', async () => {
      const assignmentData = {
        email: 'assignee@example.com',
        taskTitle: 'Test Task',
        projectName: 'Test Project',
        assignerName: 'Test Assigner'
      };

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendTaskAssignment(assignmentData);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Aufgaben-Zuweisung fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('sendNotification', () => {
    it('sollte Benachrichtigung erfolgreich senden', async () => {
      const notificationData = {
        email: 'user@example.com',
        subject: 'Test Notification',
        message: 'This is a test notification'
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'OK'
      });

      const result = await service.sendNotification(notificationData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: notificationData.email,
        subject: notificationData.subject,
        html: expect.stringContaining(notificationData.message)
      });
    });

    it('sollte false zurückgeben wenn Benachrichtigung fehlschlägt', async () => {
      const notificationData = {
        email: 'user@example.com',
        subject: 'Test Notification',
        message: 'This is a test notification'
      };

      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.sendNotification(notificationData);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Benachrichtigung fehlgeschlagen:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('generateEmailTemplate', () => {
    it('sollte HTML-Template für Magic Link generieren', () => {
      const token = 'magic-link-token';
      const baseUrl = 'https://app.example.com';

      const template = service.generateEmailTemplate('magic-link', { token, baseUrl });

      expect(template).toContain('Magic Link');
      expect(template).toContain(token);
      expect(template).toContain(baseUrl);
      expect(template).toMatch(/<html>/);
      expect(template).toMatch(/<body>/);
    });

    it('sollte HTML-Template für Passwort-Reset generieren', () => {
      const resetToken = 'reset-token';
      const baseUrl = 'https://app.example.com';

      const template = service.generateEmailTemplate('password-reset', { resetToken, baseUrl });

      expect(template).toContain('Passwort zurücksetzen');
      expect(template).toContain(resetToken);
      expect(template).toContain(baseUrl);
      expect(template).toMatch(/<html>/);
      expect(template).toMatch(/<body>/);
    });

    it('sollte HTML-Template für Willkommens-E-Mail generieren', () => {
      const userName = 'Test User';

      const template = service.generateEmailTemplate('welcome', { userName });

      expect(template).toContain('Willkommen');
      expect(template).toContain(userName);
      expect(template).toMatch(/<html>/);
      expect(template).toMatch(/<body>/);
    });

    it('sollte leeren String für unbekannte Template-Typen zurückgeben', () => {
      const template = service.generateEmailTemplate('unknown' as any, {});

      expect(template).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('sollte gültige E-Mail-Adressen akzeptieren', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@numbers.com'
      ];

      validEmails.forEach(email => {
        expect(service.validateEmail(email)).toBe(true);
      });
    });

    it('sollte ungültige E-Mail-Adressen ablehnen', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user space@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(service.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('sanitizeEmailContent', () => {
    it('sollte HTML-Inhalt bereinigen', () => {
      const dirtyContent = '<script>alert("xss")</script><p>Safe content</p>';
      const cleanContent = service.sanitizeEmailContent(dirtyContent);

      expect(cleanContent).not.toContain('<script>');
      expect(cleanContent).toContain('<p>Safe content</p>');
    });

    it('sollte gefährliche HTML-Tags entfernen', () => {
      const dangerousContent = '<iframe src="malicious.com"></iframe><div>Safe</div>';
      const safeContent = service.sanitizeEmailContent(dangerousContent);

      expect(safeContent).not.toContain('<iframe>');
      expect(safeContent).toContain('<div>Safe</div>');
    });
  });
});
