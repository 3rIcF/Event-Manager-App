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
import { TimeLogsService } from './time-logs.service';
import { CreateTimeLogDto, UpdateTimeLogDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@elementaro/types';

@Controller('time-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  create(@Body() createTimeLogDto: CreateTimeLogDto) {
    return this.timeLogsService.create(createTimeLogDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findAll(
    @Query('taskId') taskId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.timeLogsService.findAll(taskId, userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  findOne(@Param('id') id: string) {
    return this.timeLogsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  update(@Param('id') id: string, @Body() updateTimeLogDto: UpdateTimeLogDto) {
    return this.timeLogsService.update(id, updateTimeLogDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  remove(@Param('id') id: string) {
    return this.timeLogsService.remove(id);
  }

  @Get('task/:taskId/summary')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getTaskTimeSummary(@Param('taskId') taskId: string) {
    return this.timeLogsService.getTaskTimeSummary(taskId);
  }

  @Get('user/:userId/summary')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER, UserRole.ONSITE)
  getUserTimeSummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeLogsService.getUserTimeSummary(userId, startDate, endDate);
  }
}
