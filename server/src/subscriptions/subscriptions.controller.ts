import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("subscriptions")
@Controller()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get("subscription-plans")
  @ApiOperation({ summary: "List visible subscription plans" })
  async findPlans() {
    return this.subscriptionsService.findPlans();
  }

  @Post("subscriptions/create-checkout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create Stripe checkout session" })
  async createCheckout(
    @Body("planId") planId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.createCheckoutSession(user.id, planId);
  }

  @Get("subscriptions/my")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's subscription" })
  async getMySubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getUserSubscription(user.id);
  }

  @Post("subscriptions/cancel")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel subscription" })
  async cancel(@CurrentUser() user: any) {
    return this.subscriptionsService.cancelSubscription(user.id);
  }

  @Post("subscriptions/webhook")
  @ApiOperation({ summary: "Stripe webhook handler" })
  async webhook(@Req() req: any, @Headers("stripe-signature") signature: string) {
    return this.subscriptionsService.handleWebhook(req.body);
  }
}