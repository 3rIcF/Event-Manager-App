import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

// Mock-Daten für Tests
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  startDate: new Date('2024-01-01'),
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date('2024-01-31'),
  locationName: 'Test Location',
  status: 'PLANNING' as const,
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  projectId: 'project-1',
  assigneeId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Neue Mock-Daten für Kanban Services
export const mockKanbanBoard = {
  id: 'board-1',
  name: 'Test Kanban Board',
  description: 'Test Description',
  projectId: 'project-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockKanbanColumn = {
  id: 'column-1',
  name: 'To Do',
  order: 1,
  boardId: 'board-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockKanbanTask = {
  id: 'kanban-task-1',
  title: 'Test Kanban Task',
  description: 'Test Description',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  columnId: 'column-1',
  boardId: 'board-1',
  assigneeId: 'user-1',
  projectId: 'project-1',
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Neue Mock-Daten für Workflow Services
export const mockWorkflow = {
  id: 'workflow-1',
  name: 'Test Workflow',
  description: 'Test Description',
  projectId: 'project-1',
  status: 'ACTIVE' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockWorkflowStage = {
  id: 'stage-1',
  name: 'Planning',
  description: 'Planning Stage',
  order: 1,
  workflowId: 'workflow-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock PrismaService
export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  // Neue Kanban Services
  kanbanBoard: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  kanbanColumn: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  kanbanTask: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  // Neue Workflow Services
  workflow: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  workflowStage: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  $transaction: jest.fn()
};

// Mock JwtService
export const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn()
};

// Mock ConfigService
export const mockConfigService = {
  get: jest.fn()
};

// Mock EmailService
export const mockEmailService = {
  sendEmail: jest.fn(),
  sendMagicLink: jest.fn(),
  sendPasswordReset: jest.fn()
};

// Test-Module Factory
export async function createTestingModule(providers: any[]): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      ...providers,
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
}

// Reset alle Mocks
export function resetAllMocks(): void {
  jest.clearAllMocks();
  Object.values(mockPrismaService).forEach(mock => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach(fn => {
        if (typeof fn === 'function') {
          (fn as jest.Mock).mockClear();
        }
      });
    }
  });
  Object.values(mockJwtService).forEach(fn => {
    if (typeof fn === 'function') {
      (fn as jest.Mock).mockClear();
    }
  });
  Object.values(mockConfigService).forEach(fn => {
    if (typeof fn === 'function') {
      (fn as jest.Mock).mockClear();
    }
  });
  Object.values(mockEmailService).forEach(fn => {
    if (typeof fn === 'function') {
      (fn as jest.Mock).mockClear();
    }
  });
}

// Test-Daten-Generatoren
export function generateMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockUser,
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`
  }));
}

export function generateMockProjects(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockProject,
    id: `project-${i + 1}`,
    name: `Project ${i + 1}`,
    startDate: new Date(2024, 0, 1 + i),
    dateFrom: new Date(2024, 0, 1 + i),
    dateTo: new Date(2024, 0, 31 + i)
  }));
}

export function generateMockTasks(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockTask,
    id: `task-${i + 1}`,
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`
  }));
}

// Neue Test-Daten-Generatoren für Kanban Services
export function generateMockKanbanBoards(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockKanbanBoard,
    id: `board-${i + 1}`,
    name: `Kanban Board ${i + 1}`,
    description: `Description for board ${i + 1}`
  }));
}

export function generateMockKanbanColumns(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockKanbanColumn,
    id: `column-${i + 1}`,
    name: `Column ${i + 1}`,
    order: i + 1
  }));
}

export function generateMockKanbanTasks(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockKanbanTask,
    id: `kanban-task-${i + 1}`,
    title: `Kanban Task ${i + 1}`,
    description: `Description for kanban task ${i + 1}`,
    order: i + 1
  }));
}

// Neue Test-Daten-Generatoren für Workflow Services
export function generateMockWorkflows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockWorkflow,
    id: `workflow-${i + 1}`,
    name: `Workflow ${i + 1}`,
    description: `Description for workflow ${i + 1}`
  }));
}

export function generateMockWorkflowStages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockWorkflowStage,
    id: `stage-${i + 1}`,
    name: `Stage ${i + 1}`,
    description: `Description for stage ${i + 1}`,
    order: i + 1
  }));
}
