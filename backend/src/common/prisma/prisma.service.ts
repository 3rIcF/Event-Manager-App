import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('📄 Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Clean in correct order to respect foreign key constraints
    await this.comment.deleteMany();
    await this.diffNotification.deleteMany();
    await this.projectMaterial.deleteMany();
    await this.projectSupplier.deleteMany();
    await this.projectMember.deleteMany();
    await this.globalMaterial.deleteMany();
    await this.globalSupplier.deleteMany();
    await this.project.deleteMany();
    await this.user.deleteMany();
  }
}