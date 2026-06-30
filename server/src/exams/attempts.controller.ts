import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AttemptsService } from "./attempts.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("exam-attempts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountTypeGuard)
@AllowedAccountTypes("full", "course_only")
@Controller("exam-attempts")
export class AttemptsController {
  constructor(private attemptsService: AttemptsService) {}

  @Post()
  @ApiOperation({ summary: "Start new exam attempt" })
  async create(
    @Body() data: { examId: string; mode: string; questionCount: number; timeLimit?: number; customTitle?: string },
    @CurrentUser() user: any,
  ) {
    return this.attemptsService.create({ ...data, userId: user.id });
  }

  @Get()
  @ApiOperation({ summary: "Get user's attempt history" })
  async findAll(
    @CurrentUser() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.attemptsService.findByUser(user.id, page, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get attempt with answers" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.attemptsService.findById(id, user.id);
  }

  @Patch(":id/answer")
  @ApiOperation({ summary: "Answer question in attempt" })
  async answer(
    @Param("id") id: string,
    @Body() data: { questionId: string; selectedOptionId: string; timeSpent: number },
    @CurrentUser() user: any,
  ) {
    return this.attemptsService.answerQuestion({ attemptId: id, ...data }, user.id);
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Complete attempt" })
  async complete(@Param("id") id: string, @CurrentUser() user: any) {
    return this.attemptsService.complete(id, user.id);
  }
}