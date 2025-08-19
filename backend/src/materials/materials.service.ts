import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateGlobalMaterialDto, CreateProjectMaterialDto } from './dto/create-material.dto';
import { UpdateGlobalMaterialDto, UpdateProjectMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  // Global Materials
  async createGlobalMaterial(createMaterialDto: CreateGlobalMaterialDto, createdById: string) {
    const portfolio = createMaterialDto.portfolio ? JSON.stringify(createMaterialDto.portfolio) : null;
    
    return this.prisma.globalMaterial.create({
      data: {
        ...createMaterialDto,
        portfolio,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAllGlobalMaterials() {
    const materials = await this.prisma.globalMaterial.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            projectMaterials: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return materials.map(material => ({
      ...material,
      portfolio: material.portfolio ? JSON.parse(material.portfolio) : [],
      usageCount: material._count.projectMaterials,
    }));
  }

  async findOneGlobalMaterial(id: string) {
    const material = await this.prisma.globalMaterial.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        projectMaterials: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Global material with ID ${id} not found`);
    }

    return {
      ...material,
      portfolio: material.portfolio ? JSON.parse(material.portfolio) : [],
    };
  }

  async updateGlobalMaterial(id: string, updateMaterialDto: UpdateGlobalMaterialDto, currentUserId: string) {
    const material = await this.findOneGlobalMaterial(id);
    
    // Check permissions - only creator or admin can update
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (material.createdById !== currentUserId && currentUser?.role !== 'ADMIN') {
      throw new ForbiddenException('You can only update materials you created');
    }

    const portfolio = updateMaterialDto.portfolio ? JSON.stringify(updateMaterialDto.portfolio) : undefined;

    return this.prisma.globalMaterial.update({
      where: { id },
      data: {
        ...updateMaterialDto,
        ...(portfolio !== undefined && { portfolio }),
        version: {
          increment: 1,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async removeGlobalMaterial(id: string, currentUserId: string) {
    const material = await this.findOneGlobalMaterial(id);
    
    // Check permissions
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (material.createdById !== currentUserId && currentUser?.role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete materials you created');
    }

    // Check if material is used in any projects
    const usageCount = await this.prisma.projectMaterial.count({
      where: { globalMaterialId: id },
    });

    if (usageCount > 0) {
      throw new ForbiddenException('Cannot delete material that is used in projects');
    }

    return this.prisma.globalMaterial.delete({
      where: { id },
    });
  }

  // Project Materials
  async createProjectMaterial(projectId: string, createMaterialDto: CreateProjectMaterialDto, currentUserId: string) {
    // Check project access
    await this.checkProjectAccess(projectId, currentUserId);

    // Verify global material exists
    await this.findOneGlobalMaterial(createMaterialDto.globalMaterialId);

    const needs = createMaterialDto.needs ? JSON.stringify(createMaterialDto.needs) : null;
    const deliveryTime = createMaterialDto.deliveryTime ? new Date(createMaterialDto.deliveryTime) : null;
    const pickupTime = createMaterialDto.pickupTime ? new Date(createMaterialDto.pickupTime) : null;

    return this.prisma.projectMaterial.create({
      data: {
        ...createMaterialDto,
        projectId,
        needs,
        deliveryTime,
        pickupTime,
      },
      include: {
        globalMaterial: true,
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  async findProjectMaterials(projectId: string, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId);

    const materials = await this.prisma.projectMaterial.findMany({
      where: { projectId },
      include: {
        globalMaterial: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return materials.map(material => ({
      ...material,
      needs: material.needs ? JSON.parse(material.needs) : [],
      overriddenFields: material.overriddenFields ? JSON.parse(material.overriddenFields) : [],
    }));
  }

  async updateProjectMaterial(projectId: string, materialId: string, updateMaterialDto: UpdateProjectMaterialDto, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId, ['OWNER', 'MANAGER']);

    const needs = updateMaterialDto.needs ? JSON.stringify(updateMaterialDto.needs) : undefined;
    const deliveryTime = updateMaterialDto.deliveryTime ? new Date(updateMaterialDto.deliveryTime) : undefined;
    const pickupTime = updateMaterialDto.pickupTime ? new Date(updateMaterialDto.pickupTime) : undefined;

    return this.prisma.projectMaterial.update({
      where: {
        id: materialId,
        projectId, // Ensure material belongs to project
      },
      data: {
        ...updateMaterialDto,
        ...(needs !== undefined && { needs }),
        ...(deliveryTime !== undefined && { deliveryTime }),
        ...(pickupTime !== undefined && { pickupTime }),
      },
      include: {
        globalMaterial: true,
      },
    });
  }

  async removeProjectMaterial(projectId: string, materialId: string, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId, ['OWNER', 'MANAGER']);

    return this.prisma.projectMaterial.delete({
      where: {
        id: materialId,
        projectId, // Ensure material belongs to project
      },
    });
  }

  // Statistics and Analytics
  async getMaterialStats() {
    const [totalMaterials, totalProjectMaterials, categoriesCount] = await Promise.all([
      this.prisma.globalMaterial.count(),
      this.prisma.projectMaterial.count(),
      this.prisma.globalMaterial.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
      }),
    ]);

    const topCategories = categoriesCount
      .sort((a, b) => b._count.category - a._count.category)
      .slice(0, 5);

    return {
      totalMaterials,
      totalProjectMaterials,
      categoriesCount: categoriesCount.length,
      topCategories,
    };
  }

  private async checkProjectAccess(projectId: string, currentUserId: string, requiredRoles?: string[]) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    // Admins have access to everything
    if (currentUser?.role === 'ADMIN') {
      return;
    }

    // Check if user is a project member
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: currentUserId,
          projectId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied: You are not a member of this project');
    }

    // Check role requirements
    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(`Access denied: Required role: ${requiredRoles.join(' or ')}`);
    }
  }
}