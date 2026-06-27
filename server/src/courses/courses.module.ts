import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { QuizAttemptsController } from "./quiz-attempts.controller";
import { QuizAttemptsService } from "./quiz-attempts.service";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [SubscriptionsModule],
  controllers: [CoursesController, QuizAttemptsController],
  providers: [CoursesService, QuizAttemptsService],
  exports: [CoursesService],
})
export class CoursesModule {}