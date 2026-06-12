import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { QuizAttemptsController } from "./quiz-attempts.controller";
import { QuizAttemptsService } from "./quiz-attempts.service";

@Module({
  controllers: [CoursesController, QuizAttemptsController],
  providers: [CoursesService, QuizAttemptsService],
  exports: [CoursesService],
})
export class CoursesModule {}