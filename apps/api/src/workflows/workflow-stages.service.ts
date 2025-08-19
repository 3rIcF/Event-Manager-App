import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowStageDto, UpdateWorkflowStageDto } from './dto';

@Injectable()
export class WorkflowStagesService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowStageDto: CreateWorkflowStageDto) {
    const { workflowId, ...stageData } = createWorkflowStageDto;

    // Validate workflow exists
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }

    // If order is not provided, set it to the next available order
    if (!stageData.order) {
      const lastStage = await this.prisma.workflowStage.findFirst({
        where: { workflowId },
        orderBy: { order: 'desc' },
      });
      stageData.order = lastStage ? lastStage.order + 1 : 1;
    }

    return this.prisma.workflowStage.create({
      data: {
        ...stageData,
        status: stageData.status || 'ACTIVE',
        workflow: { connect: { id: workflowId } },
      },
      include: {
        workflow: true,
        tasks: true,
      },
    });
  }

  async findAll(workflowId?: string) {
    const where = workflowId ? { workflowId } : {};
    
    return this.prisma.workflowStage.findMany({
      where,
      include: {
        workflow: true,
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id },
      include: {
        workflow: true,
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException(`Workflow stage with ID ${id} not found`);
    }

    return stage;
  }

  async update(id: string, updateWorkflowStageDto: UpdateWorkflowStageDto) {
    // Check if stage exists
    const existingStage = await this.prisma.workflowStage.findUnique({
      where: { id },
    });
    if (!existingStage) {
      throw new NotFoundException(`Workflow stage with ID ${id} not found`);
    }

    return this.prisma.workflowStage.update({
      where: { id },
      data: updateWorkflowStageDto,
      include: {
        workflow: true,
        tasks: true,
      },
    });
  }

  async remove(id: string) {
    // Check if stage exists
    const existingStage = await this.prisma.workflowStage.findUnique({
      where: { id },
    });
    if (!existingStage) {
      throw new NotFoundException(`Workflow stage with ID ${id} not found`);
    }

    // Check if stage has tasks
    const tasks = await this.prisma.task.findMany({
      where: { workflowStageId: id },
    });

    if (tasks.length > 0) {
      throw new BadRequestException('Cannot delete stage with associated tasks. Move or remove tasks first.');
    }

    return this.prisma.workflowStage.delete({
      where: { id },
    });
  }

  async reorderStages(workflowId: string, stageIds: string[]) {
    // Validate workflow exists
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }

    // Validate all stages belong to the workflow
    const stages = await this.prisma.workflowStage.findMany({
      where: { id: { in: stageIds } },
    });

    if (stages.length !== stageIds.length) {
      throw new BadRequestException('Some stages not found');
    }

    const invalidStages = stages.filter(stage => stage.workflowId !== workflowId);
    if (invalidStages.length > 0) {
      throw new BadRequestException('Some stages do not belong to the specified workflow');
    }

    // Update order for each stage
    const updates = stageIds.map((stageId, index) => 
      this.prisma.workflowStage.update({
        where: { id: stageId },
        data: { order: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return this.prisma.workflowStage.findMany({
      where: { workflowId },
      orderBy: { order: 'asc' },
      include: {
        workflow: true,
        tasks: true,
      },
    });
  }

  async moveStageToWorkflow(stageId: string, newWorkflowId: string, newOrder?: number) {
    // Check if stage exists
    const existingStage = await this.prisma.workflowStage.findUnique({
      where: { id: stageId },
    });
    if (!existingStage) {
      throw new NotFoundException(`Workflow stage with ID ${stageId} not found`);
    }

    // Validate new workflow exists
    const newWorkflow = await this.prisma.workflow.findUnique({
      where: { id: newWorkflowId },
    });
    if (!newWorkflow) {
      throw new NotFoundException(`Workflow with ID ${newWorkflowId} not found`);
    }

    // If new order is not provided, set it to the next available order
    if (!newOrder) {
      const lastStage = await this.prisma.workflowStage.findFirst({
        where: { workflowId: newWorkflowId },
        orderBy: { order: 'desc' },
      });
      newOrder = lastStage ? lastStage.order + 1 : 1;
    }

    return this.prisma.workflowStage.update({
      where: { id: stageId },
      data: {
        workflowId: newWorkflowId,
        order: newOrder,
      },
      include: {
        workflow: true,
        tasks: true,
      },
    });
  }

  async getStageTasks(id: string) {
    const stage = await this.prisma.workflowStage.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignee: true,
            dependencies: {
              include: {
                dependentTask: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException(`Workflow stage with ID ${id} not found`);
    }

    return stage.tasks;
  }
}
