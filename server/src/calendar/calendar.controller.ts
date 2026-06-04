import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("calendar")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("calendar")
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: "Get events filtered by date range" })
  async findAll(
    @CurrentUser() user: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.calendarService.findAll({
      userId: user.role === "admin" ? undefined : user.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Post()
  @ApiOperation({ summary: "Create event" })
  async create(@Body() data: any, @CurrentUser() user: any) {
    return this.calendarService.create({ ...data, createdBy: user.id });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update event" })
  async update(@Param("id") id: string, @Body() data: any) {
    return this.calendarService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete event" })
  async remove(@Param("id") id: string) {
    return this.calendarService.delete(id);
  }
}