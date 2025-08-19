import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowStagesController } from './workflow-stages.controller';
import { WorkflowStagesService } from './workflow-stages.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowsController, WorkflowStagesController],
  providers: [WorkflowsService, WorkflowStagesService],
  exports: [WorkflowsService, WorkflowStagesService],
})
export class WorkflowsModule {}
