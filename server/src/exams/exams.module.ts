import { Module } from "@nestjs/common";
import { ExamsController } from "./exams.controller";
import { ExamsService } from "./exams.service";
import { AttemptsController } from "./attempts.controller";
import { AttemptsService } from "./attempts.service";

@Module({
  controllers: [ExamsController, AttemptsController],
  providers: [ExamsService, AttemptsService],
  exports: [ExamsService, AttemptsService],
})
export class ExamsModule {}