import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto, UpdateProjectMemberDto } from './dto/project-member.dto';
import { Project, ProjectMember, User } from '@prisma/client';

type ProjectWithMembers = Project & {
  responsible: User;
  members: (ProjectMember & { user: User })[];
  _count: {
    materials: number;
    suppliers: number;
    comments: number;
  };
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, currentUserId: string): Promise<Project> {
    const { responsibleId = currentUserId, ...projectData } = createProjectDto;

    // Verify responsible user exists
    const responsibleUser = await this.prisma.user.findUnique({
      where: { id: responsibleId },
    });

    if (!responsibleUser) {
      throw new BadRequestException('Responsible user not found');
    }

    // Validate date range
    const startDate = new Date(projectData.startDate);
    const endDate = new Date(projectData.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        startDate,
        endDate,
        responsibleId,
      },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Add creator as project owner
    await this.prisma.projectMember.create({
      data: {
        userId: currentUserId,
        projectId: project.id,
        role: 'OWNER',
      },
    });

    // Add responsible user as manager if different from creator
    if (responsibleId !== currentUserId) {
      await this.prisma.projectMember.create({
        data: {
          userId: responsibleId,
          projectId: project.id,
          role: 'MANAGER',
        },
      });
    }

    return project;
  }

  async findAll(currentUserId: string): Promise<ProjectWithMembers[]> {
    // Get user's role to determine access
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    let whereCondition = {};

    // Regular users can only see projects they're members of
    if (currentUser?.role === 'USER') {
      whereCondition = {
        members: {
          some: {
            userId: currentUserId,
          },
        },
      };
    }
    // Managers and admins can see all projects

    return this.prisma.project.findMany({
      where: whereCondition,
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            materials: true,
            suppliers: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, currentUserId: string): Promise<ProjectWithMembers> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            materials: true,
            suppliers: true,
            comments: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user has access to this project
    await this.checkProjectAccess(id, currentUserId);

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, currentUserId: string): Promise<Project> {
    // Check if project exists and user has access
    await this.checkProjectAccess(id, currentUserId, ['OWNER', 'MANAGER']);

    // Validate date range if dates are being updated
    if (updateProjectDto.startDate || updateProjectDto.endDate) {
      const currentProject = await this.prisma.project.findUnique({ where: { id } });
      const startDate = new Date(updateProjectDto.startDate || currentProject!.startDate);
      const endDate = new Date(updateProjectDto.endDate || currentProject!.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const updateData: any = { ...updateProjectDto };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        responsible: {
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

  async remove(id: string, currentUserId: string): Promise<Project> {
    // Check if project exists and user has access (only owners can delete)
    await this.checkProjectAccess(id, currentUserId, ['OWNER']);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async getProjectMembers(projectId: string, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId);

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async addProjectMember(projectId: string, addMemberDto: AddProjectMemberDto, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId, ['OWNER', 'MANAGER']);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: addMemberDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: addMemberDto.userId,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a project member');
    }

    return this.prisma.projectMember.create({
      data: {
        userId: addMemberDto.userId,
        projectId,
        role: addMemberDto.role,
      },
      include: {
        user: {
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

  async updateProjectMember(projectId: string, userId: string, updateMemberDto: UpdateProjectMemberDto, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId, ['OWNER', 'MANAGER']);

    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    return this.prisma.projectMember.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        role: updateMemberDto.role,
      },
      include: {
        user: {
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

  async removeProjectMember(projectId: string, userId: string, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId, ['OWNER', 'MANAGER']);

    // Don't allow removing the last owner
    const owners = await this.prisma.projectMember.findMany({
      where: {
        projectId,
        role: 'OWNER',
      },
    });

    const memberToRemove = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!memberToRemove) {
      throw new NotFoundException('Project member not found');
    }

    if (memberToRemove.role === 'OWNER' && owners.length === 1) {
      throw new BadRequestException('Cannot remove the last project owner');
    }

    return this.prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  async getProjectStats(projectId: string, currentUserId: string) {
    await this.checkProjectAccess(projectId, currentUserId);

    const [materialsCount, suppliersCount, commentsCount, membersCount] = await Promise.all([
      this.prisma.projectMaterial.count({ where: { projectId } }),
      this.prisma.projectSupplier.count({ where: { projectId } }),
      this.prisma.comment.count({ where: { projectId } }),
      this.prisma.projectMember.count({ where: { projectId } }),
    ]);

    return {
      materialsCount,
      suppliersCount,
      commentsCount,
      membersCount,
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