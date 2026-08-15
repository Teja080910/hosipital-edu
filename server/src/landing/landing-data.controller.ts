import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OptionalJwtAuthGuard } from "../common/guards/optional-jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { TestimonialsService } from "./testimonials.service";
import { ParametersService } from "../parameters/parameters.service";
import { ExamsService } from "../exams/exams.service";

@ApiTags("landing")
@Controller("landing-data")
export class LandingDataController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private testimonialsService: TestimonialsService,
    private parametersService: ParametersService,
    private examsService: ExamsService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Get all data for the landing page (public)" })
  async getLandingData(@CurrentUser() user?: any) {
    const isAdmin = user && (user.role === "admin" || user.role === "super_admin");
    const [plans, testimonials, parameters, exams] = await Promise.all([
      this.subscriptionsService.findPlans(true),
      this.testimonialsService.findAll(),
      this.parametersService.findAll(),
      this.examsService.findAll(user),
    ]);
    let mySubscription = null;
    if (user && !isAdmin) {
      mySubscription = await this.subscriptionsService.getUserSubscription(user.id);
    }
    return { plans, mySubscription, testimonials, parameters, exams };
  }
}
