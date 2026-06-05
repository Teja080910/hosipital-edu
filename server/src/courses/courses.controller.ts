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
import { CoursesService } from "./courses.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("courses")
@Controller("courses")
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: "List courses" })
  async findAll(@Query("all") all?: string) {
    return this.coursesService.findAll(all !== "true");
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get course with modules and lessons" })
  async findOne(@Param("slug") slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create course (admin)" })
  async create(@Body() data: any, @CurrentUser() user: any) {
    return this.coursesService.create({ ...data, createdBy: user.id });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update course (admin)" })
  async update(@Param("id") id: string, @Body() data: any) {
    return this.coursesService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete course (admin)" })
  async remove(@Param("id") id: string) {
    return this.coursesService.softDelete(id);
  }

  @Post(":id/enroll")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Enroll in course" })
  async enroll(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body("stripePaymentId") stripePaymentId?: string,
  ) {
    return this.coursesService.enroll(user.id, id, stripePaymentId);
  }
}