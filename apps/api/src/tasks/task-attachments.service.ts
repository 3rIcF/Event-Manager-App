import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskAttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(taskId: string, fileId: string, userId: string, fileName?: string) {
    // Validate task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Validate file exists
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.taskAttachment.create({
      data: {
        taskId,
        fileId,
        fileName: fileName || file.name || 'Unnamed file',
        fileUrl: file.filePath || '',
        fileSize: file.size || 0,
        uploadedBy: user.name,
      },
      include: {
        task: true,
        file: true,
      },
    });
  }

  async findAll(taskId: string) {
    return this.prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        file: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const attachment = await this.prisma.taskAttachment.findUnique({
      where: { id },
      include: {
        task: true,
        file: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async update(id: string, fileName: string) {
    // Check if attachment exists
    const existingAttachment = await this.prisma.taskAttachment.findUnique({
      where: { id },
    });
    if (!existingAttachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return this.prisma.taskAttachment.update({
      where: { id },
      data: { fileName },
      include: {
        task: true,
        file: true,
      },
    });
  }

  async remove(id: string) {
    // Check if attachment exists
    const existingAttachment = await this.prisma.taskAttachment.findUnique({
      where: { id },
    });
    if (!existingAttachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return this.prisma.taskAttachment.delete({
      where: { id },
    });
  }

  async getAttachmentStats(taskId: string) {
    const attachments = await this.prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        file: true,
      },
    });

    const totalFiles = attachments.length;
    const totalSize = attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0);
    const fileTypes = attachments.reduce((acc, att) => {
      const type = att.file?.mimeType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      taskId,
      totalFiles,
      totalSize,
      fileTypes,
      averageSize: totalFiles > 0 ? totalSize / totalFiles : 0,
    };
  }

  async searchAttachments(taskId: string, query: string) {
    return this.prisma.taskAttachment.findMany({
      where: {
        taskId,
        OR: [
          {
            fileName: {
              contains: query,
            },
          },
          {
            file: {
              OR: [
                {
                  mimeType: {
                    contains: query,
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        file: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAttachmentsByType(taskId: string, mimeType: string) {
    return this.prisma.taskAttachment.findMany({
      where: {
        taskId,
        file: {
          mimeType: {
            contains: mimeType,
          },
        },
      },
      include: {
        file: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
