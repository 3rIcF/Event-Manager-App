# Event Manager App - Testing Guide

## Übersicht

Dieses Dokument beschreibt die Test-Strategie und -Implementierung für die Event Manager App. Wir verwenden Jest als Testing-Framework und haben umfassende Unit-Tests für alle wichtigen Services erstellt.

## 🧪 Test-Struktur

```
src/
├── test-utils/           # Test-Utilities und Mock-Daten
│   ├── test-utils.ts     # Haupt-Test-Utilities
│   └── jest-setup.ts     # Jest-Globalkonfiguration
├── auth/
│   └── auth.service.spec.ts
├── users/
│   └── users.service.spec.ts
├── projects/
│   └── projects.service.spec.ts
├── tasks/
│   └── tasks.service.spec.ts
├── email/
│   └── email.service.spec.ts
└── prisma/
    └── prisma.service.spec.ts
```

## 🚀 Tests ausführen

### Alle Tests ausführen
```bash
npm run test
```

### Tests mit Coverage
```bash
npm run test:cov
```

### Tests im Watch-Modus
```bash
npm run test:watch
```

### Tests im Debug-Modus
```bash
npm run test:debug
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test-Skript verwenden
```bash
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

## 📊 Coverage-Ziele

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🎯 Test-Strategie

### 1. Unit-Tests
- **Ziel**: Teste einzelne Funktionen/Methoden isoliert
- **Coverage**: Alle öffentlichen Methoden
- **Mocking**: Externe Dependencies (Datenbank, E-Mail, etc.)

### 2. Integration-Tests
- **Ziel**: Teste Interaktionen zwischen Services
- **Coverage**: Service-zu-Service Kommunikation
- **Mocking**: Nur externe Dependencies

### 3. End-to-End Tests
- **Ziel**: Teste komplette Workflows
- **Coverage**: Benutzer-Journeys
- **Mocking**: Keine (echte Datenbank)

## 🔧 Test-Utilities

### Mock-Daten
```typescript
import { mockUser, mockProject, mockTask } from '../test-utils/test-utils';

// Verwendung
const user = mockUser;
const projects = generateMockProjects(5);
```

### Mock-Services
```typescript
import { mockPrismaService, mockJwtService } from '../test-utils/test-utils';

// Verwendung in Tests
const module = await Test.createTestingModule({
  providers: [
    YourService,
    { provide: PrismaService, useValue: mockPrismaService }
  ]
}).compile();
```

### Test-Module Factory
```typescript
import { createTestingModule } from '../test-utils/test-utils';

const module = await createTestingModule([
  YourService,
  // Weitere Services...
]);
```

## 📝 Test-Schreibweise

### Beschreibende Test-Namen
```typescript
describe('UserService', () => {
  describe('create', () => {
    it('sollte erfolgreich einen neuen Benutzer erstellen', async () => {
      // Test-Implementierung
    });

    it('sollte BadRequestException werfen wenn E-Mail fehlt', async () => {
      // Test-Implementierung
    });
  });
});
```

### Arrange-Act-Assert Pattern
```typescript
it('sollte erfolgreich einen Benutzer finden', async () => {
  // Arrange
  const userId = 'user-1';
  mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

  // Act
  const result = await service.findById(userId);

  // Assert
  expect(result).toEqual(mockUser);
  expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
    where: { id: userId }
  });
});
```

### Edge Cases testen
```typescript
it('sollte null zurückgeben wenn Benutzer nicht gefunden wird', async () => {
  mockPrismaService.user.findUnique.mockResolvedValue(null);
  
  const result = await service.findById('non-existent');
  
  expect(result).toBeNull();
});

it('sollte Fehler bei Datenbankfehlern behandeln', async () => {
  const error = new Error('Database error');
  mockPrismaService.user.findUnique.mockRejectedValue(error);
  
  await expect(service.findById('user-1')).rejects.toThrow(error);
});
```

## 🎭 Mocking-Strategien

### 1. Service-Mocks
```typescript
const mockEmailService = {
  sendEmail: jest.fn(),
  sendMagicLink: jest.fn()
};
```

### 2. Datenbank-Mocks
```typescript
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
};
```

### 3. Konfigurations-Mocks
```typescript
const mockConfigService = {
  get: jest.fn()
};
```

## 🔍 Test-Debugging

### Console-Output in Tests
```typescript
// Console-Output temporär aktivieren
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
// Test-Implementierung
consoleSpy.mockRestore();
```

### Async-Tests debuggen
```typescript
it('sollte asynchrone Operation korrekt ausführen', async () => {
  // Debugging-Informationen
  console.log('Test startet...');
  
  const result = await service.asyncOperation();
  
  console.log('Ergebnis:', result);
  expect(result).toBeDefined();
});
```

## 📈 Performance-Tests

### Langsame Abfragen identifizieren
```typescript
it('sollte Abfrage in akzeptabler Zeit ausführen', async () => {
  const startTime = Date.now();
  
  await service.expensiveOperation();
  
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(1000); // Max 1 Sekunde
});
```

## 🧹 Test-Cleanup

### Nach jedem Test
```typescript
afterEach(() => {
  resetAllMocks();
  jest.clearAllMocks();
});
```

### Nach allen Tests
```typescript
afterAll(() => {
  // Cleanup-Code
});
```

## 🚨 Häufige Probleme

### 1. Async/Await vergessen
```typescript
// ❌ Falsch
it('sollte async Operation testen', () => {
  const result = service.asyncOperation();
  expect(result).toBeDefined();
});

// ✅ Richtig
it('sollte async Operation testen', async () => {
  const result = await service.asyncOperation();
  expect(result).toBeDefined();
});
```

### 2. Mock nicht zurückgesetzt
```typescript
// ❌ Falsch
beforeEach(() => {
  // Kein Reset der Mocks
});

// ✅ Richtig
beforeEach(() => {
  resetAllMocks();
});
```

### 3. Falsche Assertions
```typescript
// ❌ Falsch
expect(mockFunction).toHaveBeenCalled();

// ✅ Richtig
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

## 📚 Best Practices

1. **Teste das Verhalten, nicht die Implementierung**
2. **Verwende beschreibende Test-Namen**
3. **Teste Edge Cases und Fehlerszenarien**
4. **Halte Tests einfach und lesbar**
5. **Verwende Setup/Teardown für komplexe Tests**
6. **Mocke externe Dependencies**
7. **Teste sowohl Erfolgs- als auch Fehlerfälle**

## 🔗 Nützliche Links

- [Jest Dokumentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 📞 Support

Bei Fragen zu Tests oder der Test-Implementierung:
1. Überprüfe die Jest-Dokumentation
2. Schaue dir bestehende Tests als Beispiele an
3. Erstelle einen Issue im Repository
4. Kontaktiere das Entwicklungsteam
