import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const { projectId, assigneeId, workflowId, workflowStageId, ...taskData } = createTaskDto;

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validate assignee exists if provided
    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException(`User with ID ${assigneeId} not found`);
      }
    }

    // Validate workflow and stage if provided
    if (workflowId) {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });
      if (!workflow) {
        throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
      }

      if (workflowStageId) {
        const stage = await this.prisma.workflowStage.findUnique({
          where: { id: workflowStageId, workflowId },
        });
        if (!stage) {
          throw new NotFoundException(`Workflow stage with ID ${workflowStageId} not found`);
        }
      }
    }

    return this.prisma.task.create({
              data: {
          ...taskData,
          status: taskData.status || 'PENDING',
          priority: taskData.priority || 'MEDIUM', // priority ist erforderlich
          project: { connect: { id: projectId } },
          ...(assigneeId && { assignee: { connect: { id: assigneeId } } }),
          ...(workflowId && { workflow: { connect: { id: workflowId } } }),
          ...(workflowStageId && { workflowStage: { connect: { id: workflowStageId } } }),
        },
      include: {
        project: true,
        assignee: true,
        workflow: true,
        workflowStage: true,
        dependencies: {
          include: {
            dependentTask: true,
          },
        },
        dependentTasks: {
          include: {
            task: true,
          },
        },
      },
    });
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    
    return this.prisma.task.findMany({
      where,
      include: {
        project: true,
        assignee: true,
        workflow: true,
        workflowStage: true,
        dependencies: {
          include: {
            dependentTask: true,
          },
        },
        dependentTasks: {
          include: {
            task: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        workflow: true,
        workflowStage: true,
        dependencies: {
          include: {
            dependentTask: true,
          },
        },
        dependentTasks: {
          include: {
            task: true,
          },
        },
        timeLogs: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            file: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { projectId, assigneeId, workflowId, workflowStageId, ...updateData } = updateTaskDto;

    // Check if task exists
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!existingTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Validate project if changing
    if (projectId && projectId !== existingTask.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    // Validate assignee if changing
    if (assigneeId && assigneeId !== existingTask.assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });
      if (!assignee) {
        throw new NotFoundException(`User with ID ${assigneeId} not found`);
      }
    }

    // Validate workflow and stage if changing
    if (workflowId && workflowId !== existingTask.workflowId) {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });
      if (!workflow) {
        throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
      }
    }

    if (workflowStageId && workflowStageId !== existingTask.workflowStageId) {
      const stage = await this.prisma.workflowStage.findUnique({
        where: { id: workflowStageId },
      });
      if (!stage) {
        throw new NotFoundException(`Workflow stage with ID ${workflowStageId} not found`);
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        ...(projectId && { project: { connect: { id: projectId } } }),
        ...(assigneeId && { assignee: { connect: { id: assigneeId } } }),
        ...(workflowId && { workflow: { connect: { id: workflowId } } }),
        ...(workflowStageId && { workflowStage: { connect: { id: workflowStageId } } }),
      },
      include: {
        project: true,
        assignee: true,
        workflow: true,
        workflowStage: true,
        dependencies: {
          include: {
            dependentTask: true,
          },
        },
        dependentTasks: {
          include: {
            task: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if task exists
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
    });
    if (!existingTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check for dependencies
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { taskId: id },
    });

    if (dependencies.length > 0) {
      throw new BadRequestException('Cannot delete task with dependencies. Remove dependencies first.');
    }

    // Delete related records first
    await this.prisma.timeLog.deleteMany({
      where: { taskId: id },
    });

    await this.prisma.taskComment.deleteMany({
      where: { taskId: id },
    });

    await this.prisma.taskAttachment.deleteMany({
      where: { taskId: id },
    });

    // Delete the task
    return this.prisma.task.delete({
      where: { id },
    });
  }

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

    return this.prisma.taskDependency.create({
      data: {
        task: { connect: { id: taskId } },
        dependentTask: { connect: { id: dependentTaskId } },
        dependencyType: 'BLOCKS', // dependencyType ist erforderlich
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
        dependentTask: true,
      },
    });

    return dependencies;
  }

  async getDependentTasks(taskId: string) {
    const dependentTasks = await this.prisma.taskDependency.findMany({
      where: { dependentTaskId: taskId },
      include: {
        task: true,
      },
    });

    return dependentTasks;
  }
}
