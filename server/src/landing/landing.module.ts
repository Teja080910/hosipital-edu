import { Module } from "@nestjs/common";
import { LandingController } from "./landing.controller";
import { LandingService } from "./landing.service";
import { TestimonialsController } from "./testimonials.controller";
import { TestimonialsService } from "./testimonials.service";
import { LandingDataController } from "./landing-data.controller";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { ParametersModule } from "../parameters/parameters.module";
import { ExamsModule } from "../exams/exams.module";

@Module({
  imports: [SubscriptionsModule, ParametersModule, ExamsModule],
  controllers: [LandingController, TestimonialsController, LandingDataController],
  providers: [LandingService, TestimonialsService],
})
export class LandingModule {}
