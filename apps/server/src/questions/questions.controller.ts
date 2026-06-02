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
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("questions")
@Controller("questions")
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: "List questions with filters" })
  @ApiQuery({ name: "examId", required: false })
  @ApiQuery({ name: "specialtyId", required: false })
  @ApiQuery({ name: "topicId", required: false })
  @ApiQuery({ name: "difficulty", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  async findAll(
    @Query("examId") examId?: string,
    @Query("specialtyId") specialtyId?: string,
    @Query("topicId") topicId?: string,
    @Query("difficulty") difficulty?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
  ) {
    return this.questionsService.findAll({ examId, specialtyId, topicId, difficulty, page, limit, search });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get question with options" })
  async findOne(@Param("id") id: string) {
    return this.questionsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create question (admin)" })
  async create(@Body() data: any) {
    return this.questionsService.create(data);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update question (admin)" })
  async update(@Param("id") id: string, @Body() data: any) {
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