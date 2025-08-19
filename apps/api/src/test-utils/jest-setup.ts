import 'reflect-metadata';

// Globale Jest-Konfiguration
beforeAll(() => {
  // Setze Umgebungsvariablen für Tests
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.BCRYPT_ROUNDS = '10';
});

afterAll(() => {
  // Cleanup nach allen Tests
  jest.clearAllMocks();
});

// Globale Mock-Konfiguration
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt')
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'test-user-id' }),
  decode: jest.fn().mockReturnValue({ sub: 'test-user-id' })
}));

// Console-Spam in Tests reduzieren
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Unterdrücke Console-Output in Tests (außer bei Fehlern)
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Stelle Console-Funktionen wieder her
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Globale Test-Utilities
global.testUtils = {
  // Warte auf asynchrone Operationen
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Erstelle zufällige Test-Daten
  createRandomId: () => Math.random().toString(36).substring(7),
  
  // Mock-Datum für Tests
  createMockDate: (daysOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  },
  
  // Validiere Objekt-Struktur
  validateObjectStructure: (obj: any, requiredKeys: string[]) => {
    return requiredKeys.every(key => key in obj);
  }
};

// TypeScript-Deklarationen
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        wait: (ms: number) => Promise<void>;
        createRandomId: () => string;
        createMockDate: (daysOffset?: number) => Date;
        validateObjectStructure: (obj: any, requiredKeys: string[]) => boolean;
      };
    }
  }
  
  var testUtils: {
    wait: (ms: number) => Promise<void>;
    createRandomId: () => string;
    createMockDate: (daysOffset?: number) => Date;
    validateObjectStructure: (obj: any, requiredKeys: string[]) => boolean;
  };
}
