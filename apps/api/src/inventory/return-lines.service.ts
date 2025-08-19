import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnLineDto, UpdateReturnLineDto } from './dto';

@Injectable()
export class ReturnLinesService {
  constructor(private prisma: PrismaService) {}

  async create(createReturnLineDto: CreateReturnLineDto) {
    const { projectId, materialId, ...returnData } = createReturnLineDto;

    // Validate project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Validate material exists
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) {
      throw new NotFoundException(`Material with ID ${materialId} not found`);
    }

    // Validate quantity is positive
    if (returnData.quantity <= 0) {
      throw new BadRequestException('Return quantity must be positive');
    }

    return this.prisma.returnLine.create({
      data: {
        ...returnData,
        project: { connect: { id: projectId } },
        material: { connect: { id: materialId } },
      },
      include: {
        project: true,
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
    });
  }

  async findAll(projectId?: string, materialId?: string) {
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (materialId) {
      where.materialId = materialId;
    }

    return this.prisma.returnLine.findMany({
      where,
      include: {
        project: true,
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const returnLine = await this.prisma.returnLine.findUnique({
      where: { id },
      include: {
        project: true,
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
    });

    if (!returnLine) {
      throw new NotFoundException(`Return line with ID ${id} not found`);
    }

    return returnLine;
  }

  async update(id: string, updateReturnLineDto: UpdateReturnLineDto) {
    // Check if return line exists
    const existingReturnLine = await this.prisma.returnLine.findUnique({
      where: { id },
    });
    if (!existingReturnLine) {
      throw new NotFoundException(`Return line with ID ${id} not found`);
    }

    // Validate quantity if updating
    if (updateReturnLineDto.quantity !== undefined && updateReturnLineDto.quantity <= 0) {
      throw new BadRequestException('Return quantity must be positive');
    }

    return this.prisma.returnLine.update({
      where: { id },
      data: updateReturnLineDto,
      include: {
        project: true,
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
    });
  }

  async remove(id: string) {
    // Check if return line exists
    const existingReturnLine = await this.prisma.returnLine.findUnique({
      where: { id },
    });
    if (!existingReturnLine) {
      throw new NotFoundException(`Return line with ID ${id} not found`);
    }

    return this.prisma.returnLine.delete({
      where: { id },
    });
  }

  async processReturn(id: string, processedBy: string, notes?: string) {
    const returnLine = await this.prisma.returnLine.findUnique({
      where: { id },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
    });

    if (!returnLine) {
      throw new NotFoundException(`Return line with ID ${id} not found`);
    }

    if (returnLine.status === 'PROCESSED') {
      throw new BadRequestException('Return line has already been processed');
    }

    // Update return line status
    const updatedReturnLine = await this.prisma.returnLine.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        returnedAt: new Date(),
        returnedBy: processedBy,
        notes: notes || returnLine.notes,
      },
      include: {
        project: true,
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
    });

    // Update inventory quantity if material has inventory SKU
    const inventorySku = await this.prisma.inventorySku.findFirst({
      where: { materialId: returnLine.materialId },
    });

    if (inventorySku) {
      await this.prisma.inventorySku.update({
        where: { id: inventorySku.id },
        data: {
          quantity: inventorySku.quantity + returnLine.quantity,
        },
      });
    }

    return updatedReturnLine;
  }

  async getReturnSummary(projectId?: string, startDate?: string, endDate?: string) {
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const returnLines = await this.prisma.returnLine.findMany({
      where,
      include: {
        project: true,
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
    });

    const totalReturns = returnLines.length;
    const totalQuantity = returnLines.reduce((sum, line) => sum + line.quantity, 0);
    const pendingReturns = returnLines.filter(line => line.status === 'PENDING').length;
    const processedReturns = returnLines.filter(line => line.status === 'PROCESSED').length;

    const materialSummary = returnLines.reduce((acc, line) => {
      const materialName = line.material.name;
      if (!acc[materialName]) {
        acc[materialName] = { count: 0, totalQuantity: 0 };
      }
      acc[materialName].count++;
      acc[materialName].totalQuantity += line.quantity;
      return acc;
    }, {} as Record<string, { count: number; totalQuantity: number }>);

    return {
      totalReturns,
      totalQuantity,
      pendingReturns,
      processedReturns,
      materialSummary,
      averageQuantity: totalReturns > 0 ? totalQuantity / totalReturns : 0,
    };
  }

  async getProjectReturns(projectId: string) {
    const returnLines = await this.prisma.returnLine.findMany({
      where: { projectId },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalQuantity = returnLines.reduce((sum, line) => sum + line.quantity, 0);
    const pendingQuantity = returnLines
      .filter(line => line.status === 'PENDING')
      .reduce((sum, line) => sum + line.quantity, 0);
    const processedQuantity = returnLines
      .filter(line => line.status === 'PROCESSED')
      .reduce((sum, line) => sum + line.quantity, 0);

    return {
      projectId,
      totalReturns: returnLines.length,
      totalQuantity,
      pendingQuantity,
      processedQuantity,
      returnLines,
    };
  }
}
