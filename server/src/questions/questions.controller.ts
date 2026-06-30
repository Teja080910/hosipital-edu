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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { QuestionsService } from "./questions.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { IsOptional, IsString, IsArray, IsUUID, IsObject } from "class-validator";

class CreateQuestionDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  options?: { text: string; isCorrect: boolean; explanation?: string }[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  specialtyId?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  options?: { text: string; isCorrect: boolean; explanation?: string }[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@ApiTags("questions")
@Controller("questions")
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full", "course_only")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List questions with filters" })
  @ApiQuery({ name: "examId", required: false })
  @ApiQuery({ name: "specialtyId", required: false })
  @ApiQuery({ name: "topicId", required: false })
  @ApiQuery({ name: "subtopicId", required: false })
  @ApiQuery({ name: "difficulty", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  async findAll(
    @Query("examId") examId?: string,
    @Query("specialtyId") specialtyId?: string,
    @Query("topicId") topicId?: string,
    @Query("subtopicId") subtopicId?: string,
    @Query("difficulty") difficulty?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.questionsService.findAll({ examId, specialtyId, topicId, subtopicId, difficulty, page, limit, search }, user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get question with options" })
  async findOne(@Param("id") id: string, @CurrentUser() user?: any) {
    return this.questionsService.findById(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create question (admin)" })
  async create(@Body() data: CreateQuestionDto, @CurrentUser() user: any) {
    return this.questionsService.create({ ...data, createdBy: user.id });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update question (admin)" })
  async update(@Param("id") id: string, @Body() data: UpdateQuestionDto) {
    return this.questionsService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete question (admin)" })
  async remove(@Param("id") id: string) {
    return this.questionsService.softDelete(id);
  }
}