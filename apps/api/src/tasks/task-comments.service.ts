import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskCommentsService {
  constructor(private prisma: PrismaService) {}

  async create(taskId: string, userId: string, content: string) {
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

    return this.prisma.taskComment.create({
      data: {
        text: content,
        content: content,
        taskId,
        userId,
      },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(taskId: string) {
    const comments = await this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  async findOne(id: string) {
    const comment = await this.prisma.taskComment.findUnique({
      where: { id },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: string, userId: string, content: string) {
    // Check if comment exists
    const existingComment = await this.prisma.taskComment.findUnique({
      where: { id },
    });
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user owns the comment
    if (existingComment.userId !== userId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    return this.prisma.taskComment.update({
      where: { id },
      data: { 
        text: content,
        content: content,
        isEdited: true,
        editedAt: new Date()
      },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if comment exists
    const existingComment = await this.prisma.taskComment.findUnique({
      where: { id },
    });
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user owns the comment or is admin
    if (existingComment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    // Delete the comment
    return this.prisma.taskComment.delete({
      where: { id },
    });
  }

  async searchComments(taskId: string, query: string) {
    return this.prisma.taskComment.findMany({
      where: {
        taskId,
        OR: [
          {
            text: {
              contains: query,
            },
          },
          {
            content: {
              contains: query,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
