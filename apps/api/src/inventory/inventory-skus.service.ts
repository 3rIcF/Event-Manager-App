import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventorySkuDto, UpdateInventorySkuDto } from './dto';

@Injectable()
export class InventorySkusService {
  constructor(private prisma: PrismaService) {}

  async create(createInventorySkuDto: CreateInventorySkuDto) {
    const { materialId, categoryId, ...skuData } = createInventorySkuDto;

    // Validate material exists
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) {
      throw new NotFoundException(`Material with ID ${materialId} not found`);
    }

    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Check if SKU already exists
    const existingSku = await this.prisma.inventorySku.findUnique({
      where: { sku: skuData.sku },
    });
    if (existingSku) {
      throw new BadRequestException(`SKU ${skuData.sku} already exists`);
    }

    // Validate quantity constraints
    if (skuData.minQuantity && skuData.maxQuantity) {
      if (skuData.minQuantity >= skuData.maxQuantity) {
        throw new BadRequestException('Minimum quantity must be less than maximum quantity');
      }
      if (skuData.quantity < skuData.minQuantity || skuData.quantity > skuData.maxQuantity) {
        throw new BadRequestException('Current quantity must be between minimum and maximum quantities');
      }
    }

    return this.prisma.inventorySku.create({
      data: {
        ...skuData,
        material: { connect: { id: materialId } },
        category: { connect: { id: categoryId } },
      },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
    });
  }

  async findAll(materialId?: string, categoryId?: string) {
    const where: any = {};
    
    if (materialId) {
      where.materialId = materialId;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.prisma.inventorySku.findMany({
      where,
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sku = await this.prisma.inventorySku.findUnique({
      where: { id },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
    });

    if (!sku) {
      throw new NotFoundException(`Inventory SKU with ID ${id} not found`);
    }

    return sku;
  }

  async findBySku(skuCode: string) {
    const sku = await this.prisma.inventorySku.findUnique({
      where: { sku: skuCode },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
    });

    if (!sku) {
      throw new NotFoundException(`Inventory SKU with SKU ${skuCode} not found`);
    }

    return sku;
  }

  async update(id: string, updateInventorySkuDto: UpdateInventorySkuDto) {
    // Check if SKU exists
    const existingSku = await this.prisma.inventorySku.findUnique({
      where: { id },
    });
    if (!existingSku) {
      throw new NotFoundException(`Inventory SKU with ID ${id} not found`);
    }

    // Validate quantity constraints if updating
    if (updateInventorySkuDto.minQuantity && updateInventorySkuDto.maxQuantity) {
      if (updateInventorySkuDto.minQuantity >= updateInventorySkuDto.maxQuantity) {
        throw new BadRequestException('Minimum quantity must be less than maximum quantity');
      }
    }

    if (updateInventorySkuDto.quantity !== undefined) {
      const minQty = updateInventorySkuDto.minQuantity || existingSku.minQuantity;
      const maxQty = updateInventorySkuDto.maxQuantity || existingSku.maxQuantity;
      
      if (minQty && updateInventorySkuDto.quantity < minQty) {
        throw new BadRequestException(`Quantity cannot be less than minimum quantity (${minQty})`);
      }
      if (maxQty && updateInventorySkuDto.quantity > maxQty) {
        throw new BadRequestException(`Quantity cannot be more than maximum quantity (${maxQty})`);
      }
    }

    return this.prisma.inventorySku.update({
      where: { id },
      data: updateInventorySkuDto,
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
    });
  }

  async remove(id: string) {
    // Check if SKU exists
    const existingSku = await this.prisma.inventorySku.findUnique({
      where: { id },
    });
    if (!existingSku) {
      throw new NotFoundException(`Inventory SKU with ID ${id} not found`);
    }

    return this.prisma.inventorySku.delete({
      where: { id },
    });
  }

  async adjustQuantity(id: string, adjustment: number, reason: string) {
    const sku = await this.prisma.inventorySku.findUnique({
      where: { id },
    });

    if (!sku) {
      throw new NotFoundException(`Inventory SKU with ID ${id} not found`);
    }

    const newQuantity = sku.quantity + adjustment;
    
    // Validate new quantity against constraints
    if (sku.minQuantity && newQuantity < sku.minQuantity) {
      throw new BadRequestException(`Quantity cannot go below minimum (${sku.minQuantity})`);
    }
    if (sku.maxQuantity && newQuantity > sku.maxQuantity) {
      throw new BadRequestException(`Quantity cannot exceed maximum (${sku.maxQuantity})`);
    }

    return this.prisma.inventorySku.update({
      where: { id },
      data: { quantity: newQuantity },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
    });
  }

  async getLowStockItems(threshold?: number) {
    const where: any = {};
    
    if (threshold) {
      where.OR = [
        { minQuantity: { not: null }, quantity: { lte: threshold } },
        { minQuantity: null, quantity: { lte: threshold } },
      ];
    } else {
      where.OR = [
        { minQuantity: { not: null }, quantity: { lte: { ref: { minQuantity: true } } } },
        { quantity: { lte: 10 } }, // Default threshold
      ];
    }

    return this.prisma.inventorySku.findMany({
      where,
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
      orderBy: { quantity: 'asc' },
    });
  }

  async getInventorySummary() {
    const skus = await this.prisma.inventorySku.findMany({
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
    });

    const totalItems = skus.length;
    const totalQuantity = skus.reduce((sum, sku) => sum + sku.quantity, 0);
    const lowStockItems = skus.filter(sku => {
      if (sku.minQuantity) {
        return sku.quantity <= sku.minQuantity;
      }
      return sku.quantity <= 10; // Default threshold
    }).length;

    const categorySummary = skus.reduce((acc, sku) => {
      const categoryName = sku.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, totalQuantity: 0 };
      }
      acc[categoryName].count++;
      acc[categoryName].totalQuantity += sku.quantity;
      return acc;
    }, {} as Record<string, { count: number; totalQuantity: number }>);

    return {
      totalItems,
      totalQuantity,
      lowStockItems,
      categorySummary,
      averageQuantity: totalItems > 0 ? totalQuantity / totalItems : 0,
    };
  }

  async searchSkus(query: string) {
    return this.prisma.inventorySku.findMany({
      where: {
        OR: [
          { sku: { contains: query } },
          { material: { name: { contains: query,  } } },
          { material: { description: { contains: query,  } } },
          { category: { name: { contains: query,  } } },
        ],
      },
      include: {
        // material: true, // 🔴 KRITISCH: Nicht im Schema verfügbar - Dateninkonsistenz bei Rückgaben!
        category: true,
      },
      orderBy: { quantity: 'desc' },
    });
  }
}
