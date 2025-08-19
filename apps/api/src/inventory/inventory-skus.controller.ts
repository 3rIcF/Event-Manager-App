import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventorySkusService } from './inventory-skus.service';
import { CreateInventorySkuDto, UpdateInventorySkuDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('inventory-skus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventorySkusController {
  constructor(private readonly inventorySkusService: InventorySkusService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  create(@Body() createInventorySkuDto: CreateInventorySkuDto) {
    return this.inventorySkusService.create(createInventorySkuDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(
    @Query('materialId') materialId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.inventorySkusService.findAll(materialId, categoryId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.inventorySkusService.findOne(id);
  }

  @Get('sku/:skuCode')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findBySku(@Param('skuCode') skuCode: string) {
    return this.inventorySkusService.findBySku(skuCode);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateInventorySkuDto: UpdateInventorySkuDto) {
    return this.inventorySkusService.update(id, updateInventorySkuDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.inventorySkusService.remove(id);
  }

  @Post(':id/adjust-quantity')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  adjustQuantity(
    @Param('id') id: string,
    @Body('adjustment') adjustment: number,
    @Body('reason') reason: string,
  ) {
    return this.inventorySkusService.adjustQuantity(id, adjustment, reason);
  }

  @Get('low-stock/items')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getLowStockItems(@Query('threshold') threshold?: number) {
    return this.inventorySkusService.getLowStockItems(threshold);
  }

  @Get('summary/overview')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getInventorySummary() {
    return this.inventorySkusService.getInventorySummary();
  }

  @Get('search/query')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  searchSkus(@Query('q') query: string) {
    return this.inventorySkusService.searchSkus(query);
  }
}
