import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskDependenciesService {
  constructor(private prisma: PrismaService) {}

  async addDependency(taskId: string, dependentTaskId: string) {
    // Check if both tasks exist
    const [task, dependentTask] = await Promise.all([
      this.prisma.task.findUnique({ where: { id: taskId } }),
      this.prisma.task.findUnique({ where: { id: dependentTaskId } }),
    ]);

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    if (!dependentTask) {
      throw new NotFoundException(`Dependent task with ID ${dependentTaskId} not found`);
    }

    // Check for circular dependencies
    if (taskId === dependentTaskId) {
      throw new BadRequestException('Task cannot depend on itself');
    }

    // Check if dependency already exists
    const existingDependency = await this.prisma.taskDependency.findFirst({
      where: {
        taskId,
        dependentTaskId,
      },
    });

    if (existingDependency) {
      throw new BadRequestException('Dependency already exists');
    }

    // Check for circular dependency chain
    const wouldCreateCycle = await this.wouldCreateCircularDependency(taskId, dependentTaskId);
    if (wouldCreateCycle) {
      throw new BadRequestException('Adding this dependency would create a circular dependency');
    }

    return this.prisma.taskDependency.create({
      data: {
        task: { connect: { id: taskId } },
        dependentTask: { connect: { id: dependentTaskId } },
        dependencyType: 'BLOCKS', // Standard dependency type
      },
      include: {
        task: true,
        dependentTask: true,
      },
    });
  }

  async removeDependency(taskId: string, dependentTaskId: string) {
    const dependency = await this.prisma.taskDependency.findFirst({
      where: {
        taskId,
        dependentTaskId,
      },
    });

    if (!dependency) {
      throw new NotFoundException('Dependency not found');
    }

    return this.prisma.taskDependency.delete({
      where: { id: dependency.id },
    });
  }

  async getTaskDependencies(taskId: string) {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { taskId },
      include: {
        dependentTask: {
          include: {
            assignee: true,
            workflowStage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dependencies;
  }

  async getDependentTasks(taskId: string) {
    const dependentTasks = await this.prisma.taskDependency.findMany({
      where: { dependentTaskId: taskId },
      include: {
        task: {
          include: {
            assignee: true,
            workflowStage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return dependentTasks;
  }

  async getDependencyChain(taskId: string) {
    const visited = new Set<string>();
    const chain: string[] = [];

    const traverse = async (currentTaskId: string, depth: number = 0): Promise<void> => {
      if (depth > 100) { // Prevent infinite loops
        throw new BadRequestException('Dependency chain too deep - possible circular dependency');
      }

      if (visited.has(currentTaskId)) {
        return;
      }

      visited.add(currentTaskId);
      chain.push(currentTaskId);

      const dependencies = await this.prisma.taskDependency.findMany({
        where: { taskId: currentTaskId },
        select: { dependentTaskId: true },
      });

      for (const dep of dependencies) {
        await traverse(dep.dependentTaskId, depth + 1);
      }
    };

    await traverse(taskId);
    return chain;
  }

  private async wouldCreateCircularDependency(taskId: string, dependentTaskId: string): Promise<boolean> {
    const visited = new Set<string>();
    
    const hasPath = async (from: string, to: string): Promise<boolean> => {
      if (from === to) return true;
      if (visited.has(from)) return false;
      
      visited.add(from);
      
      const dependencies = await this.prisma.taskDependency.findMany({
        where: { taskId: from },
        select: { dependentTaskId: true },
      });
      
      for (const dep of dependencies) {
        if (await hasPath(dep.dependentTaskId, to)) {
          return true;
        }
      }
      
      return false;
    };
    
    return await hasPath(dependentTaskId, taskId);
  }

  async getBlockedTasks(taskId: string) {
    // Get all tasks that depend on this task
    const blockingDependencies = await this.prisma.taskDependency.findMany({
      where: { dependentTaskId: taskId },
      include: {
        task: {
          include: {
            assignee: true,
            workflowStage: true,
          },
        },
      },
    });

    return blockingDependencies.map(dep => dep.task);
  }

  async getBlockingTasks(taskId: string) {
    // Get all tasks that this task depends on
    const blockingDependencies = await this.prisma.taskDependency.findMany({
      where: { taskId },
      include: {
        dependentTask: {
          include: {
            assignee: true,
            workflowStage: true,
          },
        },
      },
    });

    return blockingDependencies.map(dep => dep.dependentTask);
  }
}
