import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ExamsService } from "./exams.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../common/guards/optional-jwt-auth.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { IsOptional, IsString, IsBoolean, IsNumber, IsObject } from "class-validator";

class CreateExamDto {
  @IsObject()
  name!: object;

  @IsOptional()
  @IsObject()
  title?: object;

  @IsOptional()
  @IsObject()
  description?: object;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class UpdateExamDto {
  @IsOptional()
  @IsObject()
  name?: object;

  @IsOptional()
  @IsObject()
  title?: object;

  @IsOptional()
  @IsObject()
  description?: object;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class CreateSpecialtyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class UpdateSpecialtyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class CreateTopicDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class UpdateTopicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class CreateSubtopicDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class UpdateSubtopicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@ApiTags("exams")
@Controller("exams")
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "List all active exams (public)" })
  async findAll(@CurrentUser() user?: any) {
    return this.examsService.findAll(user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get exam with specialties" })
  async findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.examsService.findById(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create exam (admin)" })
  async create(@Body() data: CreateExamDto) {
    const payload: any = { ...data };
    if (payload.title && !payload.name) {
      payload.name = payload.title;
    }
    delete payload.title;
    return this.examsService.create(payload);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update exam (admin)" })
  async update(@Param("id") id: string, @Body() data: UpdateExamDto) {
    const payload: any = { ...data };
    if (payload.title && !payload.name) {
      payload.name = payload.title;
    }
    delete payload.title;
    return this.examsService.update(id, payload);
  }

  // ─── Specialty CRUD ───

  @Post(":examId/specialties")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create specialty (admin)" })
  async createSpecialty(@Param("examId", ParseUUIDPipe) examId: string, @Body() data: CreateSpecialtyDto) {
    return this.examsService.createSpecialty(examId, data);
  }

  @Patch("specialties/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update specialty (admin)" })
  async updateSpecialty(@Param("id") id: string, @Body() data: UpdateSpecialtyDto) {
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
  async createTopic(@Param("specialtyId", ParseUUIDPipe) specialtyId: string, @Body() data: CreateTopicDto) {
    return this.examsService.createTopic(specialtyId, data);
  }

  @Patch("topics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update topic (admin)" })
  async updateTopic(@Param("id") id: string, @Body() data: UpdateTopicDto) {
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
  async createSubtopic(@Param("topicId", ParseUUIDPipe) topicId: string, @Body() data: CreateSubtopicDto) {
    return this.examsService.createSubtopic(topicId, data);
  }

  @Patch("subtopics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update subtopic (admin)" })
  async updateSubtopic(@Param("id") id: string, @Body() data: UpdateSubtopicDto) {
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