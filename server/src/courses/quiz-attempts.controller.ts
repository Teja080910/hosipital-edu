import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { QuizAttemptsService } from "./quiz-attempts.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("course-quiz-attempts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("courses/quiz-attempts")
export class QuizAttemptsController {
  constructor(private quizAttemptsService: QuizAttemptsService) {}

  @Post()
  @ApiOperation({ summary: "Start a course quiz attempt" })
  async create(
    @Body() data: { quizId: string },
    @CurrentUser() user: any,
  ) {
    return this.quizAttemptsService.create(user.id, data.quizId);
  }

  @Get()
  @ApiOperation({ summary: "Get user's quiz attempt history" })
  async findAll(@CurrentUser() user: any) {
    return this.quizAttemptsService.findByUser(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get quiz attempt details" })
  async findOne(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.quizAttemptsService.findById(id, user.id);
  }

  @Post(":id/submit")
  @ApiOperation({ summary: "Submit quiz answers" })
  async submit(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: { answers: { questionIndex: number; selectedOptionIndex: number }[] },
    @CurrentUser() user: any,
  ) {
    return this.quizAttemptsService.submit(id, user.id, data.answers);
  }
}
