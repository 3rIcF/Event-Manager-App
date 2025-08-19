import { Module } from '@nestjs/common';
import { InventorySkusController } from './inventory-skus.controller';
import { InventorySkusService } from './inventory-skus.service';
import { ReturnLinesController } from './return-lines.controller';
import { ReturnLinesService } from './return-lines.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventorySkusController, ReturnLinesController],
  providers: [InventorySkusService, ReturnLinesService],
  exports: [InventorySkusService, ReturnLinesService],
})
export class InventoryModule {}
