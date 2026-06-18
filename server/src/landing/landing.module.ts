import { Module } from "@nestjs/common";
import { LandingController } from "./landing.controller";
import { LandingService } from "./landing.service";
import { TestimonialsController } from "./testimonials.controller";
import { TestimonialsService } from "./testimonials.service";

@Module({
  controllers: [LandingController, TestimonialsController],
  providers: [LandingService, TestimonialsService],
})
export class LandingModule {}