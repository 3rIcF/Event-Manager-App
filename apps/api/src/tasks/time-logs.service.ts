import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeLogDto, UpdateTimeLogDto } from './dto';

@Injectable()
export class TimeLogsService {
  constructor(private prisma: PrismaService) {}

  async create(createTimeLogDto: CreateTimeLogDto) {
    const { taskId, userId, ...timeLogData } = createTimeLogDto;

    // Validate task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate time range
    if (timeLogData.startTime && timeLogData.endTime) {
      if (new Date(timeLogData.startTime) >= new Date(timeLogData.endTime)) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

          return this.prisma.timeLog.create({
        data: {
          ...timeLogData,
          startTime: timeLogData.startTime || new Date().toISOString(),
          date: new Date(timeLogData.date || new Date()),
          duration: timeLogData.duration || 0, // duration ist erforderlich
          task: { connect: { id: taskId } },
          user: { connect: { id: userId } },
        },
      include: {
        task: true,
        user: true,
      },
    });
  }

  async findAll(taskId?: string, userId?: string) {
    const where: any = {};
    
    if (taskId) {
      where.taskId = taskId;
    }
    
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.timeLog.findMany({
      where,
      include: {
        task: true,
        user: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    const timeLog = await this.prisma.timeLog.findUnique({
      where: { id },
      include: {
        task: true,
        user: true,
      },
    });

    if (!timeLog) {
      throw new NotFoundException(`Time log with ID ${id} not found`);
    }

    return timeLog;
  }

  async update(id: string, updateTimeLogDto: UpdateTimeLogDto) {
    // Check if time log exists
    const existingTimeLog = await this.prisma.timeLog.findUnique({
      where: { id },
    });
    if (!existingTimeLog) {
      throw new NotFoundException(`Time log with ID ${id} not found`);
    }

    // Validate time range if updating
    if (updateTimeLogDto.startTime && updateTimeLogDto.endTime) {
      if (new Date(updateTimeLogDto.startTime) >= new Date(updateTimeLogDto.endTime)) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    return this.prisma.timeLog.update({
      where: { id },
      data: updateTimeLogDto,
      include: {
        task: true,
        user: true,
      },
    });
  }

  async remove(id: string) {
    // Check if time log exists
    const existingTimeLog = await this.prisma.timeLog.findUnique({
      where: { id },
    });
    if (!existingTimeLog) {
      throw new NotFoundException(`Time log with ID ${id} not found`);
    }

    return this.prisma.timeLog.delete({
      where: { id },
    });
  }

  async getTaskTimeSummary(taskId: string) {
    const timeLogs = await this.prisma.timeLog.findMany({
      where: { taskId },
      select: {
        startTime: true,
        endTime: true,
        duration: true,
        description: true, // Korrektes Feld aus dem Schema
        userId: true,
      },
    });

    const totalDuration = timeLogs.reduce((total, log) => {
      if (log.duration) {
        return total + log.duration;
      }
      if (log.startTime && log.endTime) {
        const duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
        return total + duration;
      }
      return total;
    }, 0);

    return {
      taskId,
      totalTimeLogs: timeLogs.length,
      totalDuration,
      totalDurationHours: totalDuration / (1000 * 60 * 60), // Convert to hours
      timeLogs,
    };
  }

  async getUserTimeSummary(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const timeLogs = await this.prisma.timeLog.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    const totalDuration = timeLogs.reduce((total, log) => {
      if (log.duration) {
        return total + log.duration;
      }
      if (log.startTime && log.endTime) {
        const duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
        return total + duration;
      }
      return total;
    }, 0);

    return {
      userId,
      totalTimeLogs: timeLogs.length,
      totalDuration,
      totalDurationHours: totalDuration / (1000 * 60 * 60), // Convert to hours
      timeLogs,
    };
  }
}
