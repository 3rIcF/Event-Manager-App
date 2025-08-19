import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto) {
    const { projectId, ...workflowData } = createWorkflowDto;

    // Validate project exists
    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    return this.prisma.workflow.create({
      data: {
        ...workflowData,
        status: workflowData.status || 'ACTIVE',
        ...(projectId && { project: { connect: { id: projectId } } }),
      },
      include: {
        project: true,
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(projectId?: string) {
    const where = projectId ? { projectId } : {};
    
    return this.prisma.workflow.findMany({
      where,
      include: {
        project: true,
        stages: {
          orderBy: { order: 'asc' },
        },
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        project: true,
        stages: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    const { projectId, ...updateData } = updateWorkflowDto;

    // Check if workflow exists
    const existingWorkflow = await this.prisma.workflow.findUnique({
      where: { id },
    });
    if (!existingWorkflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    // Validate project if changing
    if (projectId && projectId !== existingWorkflow.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
    }

    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...updateData,
        ...(projectId && { project: { connect: { id: projectId } } }),
      },
      include: {
        project: true,
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    // Check if workflow exists
    const existingWorkflow = await this.prisma.workflow.findUnique({
      where: { id },
    });
    if (!existingWorkflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    // Check if workflow has tasks
    const tasks = await this.prisma.task.findMany({
      where: { workflowId: id },
    });

    if (tasks.length > 0) {
      throw new BadRequestException('Cannot delete workflow with associated tasks. Remove tasks first.');
    }

    // Delete workflow stages first
    await this.prisma.workflowStage.deleteMany({
      where: { workflowId: id },
    });

    // Delete the workflow
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  async duplicateWorkflow(id: string, newName: string, newProjectId?: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        stages: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    // Create new workflow
    const newWorkflow = await this.prisma.workflow.create({
      data: {
        name: newName,
        description: workflow.description,
        projectId: newProjectId || workflow.projectId,
        status: 'ACTIVE',
      },
    });

    // Duplicate stages
    if (workflow.stages.length > 0) {
      const stageData = workflow.stages.map(stage => ({
        workflowId: newWorkflow.id,
        name: stage.name,
        description: stage.description,
        order: stage.order,
        status: stage.status || 'ACTIVE',
      }));

      await this.prisma.workflowStage.createMany({
        data: stageData,
      });
    }

    return this.prisma.workflow.findUnique({
      where: { id: newWorkflow.id },
      include: {
        project: true,
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getWorkflowProgress(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    const totalTasks = workflow.tasks.length;
    const completedTasks = workflow.tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgressTasks = workflow.tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const pendingTasks = workflow.tasks.filter(task => task.status === 'PENDING').length;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      workflowId: id,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      progress: Math.round(progress * 100) / 100,
      stages: workflow.stages.map(stage => {
        const stageTasks = workflow.tasks.filter(task => task.workflowStageId === stage.id);
        const stageCompleted = stageTasks.filter(task => task.status === 'COMPLETED').length;
        const stageProgress = stageTasks.length > 0 ? (stageCompleted / stageTasks.length) * 100 : 0;

        return {
          ...stage,
          totalTasks: stageTasks.length,
          completedTasks: stageCompleted,
          progress: Math.round(stageProgress * 100) / 100,
        };
      }),
    };
  }
}
