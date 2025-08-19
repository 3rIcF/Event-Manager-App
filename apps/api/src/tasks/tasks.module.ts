import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TimeLogsController } from './time-logs.controller';
import { TimeLogsService } from './time-logs.service';
import { TaskDependenciesService } from './task-dependencies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, TimeLogsController],
  providers: [TasksService, TimeLogsService, TaskDependenciesService],
  exports: [TasksService, TimeLogsService, TaskDependenciesService],
})
export class TasksModule {}
