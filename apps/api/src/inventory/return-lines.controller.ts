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
import { ReturnLinesService } from './return-lines.service';
import { CreateReturnLineDto, UpdateReturnLineDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('return-lines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnLinesController {
  constructor(private readonly returnLinesService: ReturnLinesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  create(@Body() createReturnLineDto: CreateReturnLineDto) {
    return this.returnLinesService.create(createReturnLineDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(
    @Query('projectId') projectId?: string,
    @Query('materialId') materialId?: string,
  ) {
    return this.returnLinesService.findAll(projectId, materialId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.returnLinesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  update(@Param('id') id: string, @Body() updateReturnLineDto: UpdateReturnLineDto) {
    return this.returnLinesService.update(id, updateReturnLineDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.returnLinesService.remove(id);
  }

  @Post(':id/process')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  processReturn(
    @Param('id') id: string,
    @Body('processedBy') processedBy: string,
    @Body('notes') notes?: string,
  ) {
    return this.returnLinesService.processReturn(id, processedBy, notes);
  }

  @Get('summary/overview')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getReturnSummary(
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.returnLinesService.getReturnSummary(projectId, startDate, endDate);
  }

  @Get('project/:projectId/summary')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getProjectReturns(@Param('projectId') projectId: string) {
    return this.returnLinesService.getProjectReturns(projectId);
  }
}
