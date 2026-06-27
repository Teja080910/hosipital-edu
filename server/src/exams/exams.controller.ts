import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ExamsService } from "./exams.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("exams")
@Controller("exams")
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Get()
  @ApiOperation({ summary: "List all active exams (public)" })
  async findAll(@CurrentUser() user?: any) {
    return this.examsService.findAll(user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get exam with specialties" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.examsService.findById(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create exam (admin)" })
  async create(@Body() data: any) {
    return this.examsService.create(data);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update exam (admin)" })
  async update(@Param("id") id: string, @Body() data: any) {
    return this.examsService.update(id, data);
  }

  // ─── Specialty CRUD ───

  @Post(":examId/specialties")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create specialty (admin)" })
  async createSpecialty(@Param("examId") examId: string, @Body() data: any) {
    return this.examsService.createSpecialty(examId, data);
  }

  @Patch("specialties/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update specialty (admin)" })
  async updateSpecialty(@Param("id") id: string, @Body() data: any) {
    return this.examsService.updateSpecialty(id, data);
  }

  @Delete("specialties/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete specialty (admin)" })
  async deleteSpecialty(@Param("id") id: string) {
    return this.examsService.deleteSpecialty(id);
  }

  // ─── Topic CRUD ───

  @Post("specialties/:specialtyId/topics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create topic (admin)" })
  async createTopic(@Param("specialtyId") specialtyId: string, @Body() data: any) {
    return this.examsService.createTopic(specialtyId, data);
  }

  @Patch("topics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update topic (admin)" })
  async updateTopic(@Param("id") id: string, @Body() data: any) {
    return this.examsService.updateTopic(id, data);
  }

  @Delete("topics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete topic (admin)" })
  async deleteTopic(@Param("id") id: string) {
    return this.examsService.deleteTopic(id);
  }

  // ─── Subtopic CRUD ───

  @Post("topics/:topicId/subtopics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create subtopic (admin)" })
  async createSubtopic(@Param("topicId") topicId: string, @Body() data: any) {
    return this.examsService.createSubtopic(topicId, data);
  }

  @Patch("subtopics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update subtopic (admin)" })
  async updateSubtopic(@Param("id") id: string, @Body() data: any) {
    return this.examsService.updateSubtopic(id, data);
  }

  @Delete("subtopics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete subtopic (admin)" })
  async deleteSubtopic(@Param("id") id: string) {
    return this.examsService.deleteSubtopic(id);
  }
}