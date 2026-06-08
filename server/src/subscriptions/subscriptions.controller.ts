import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("subscriptions")
@Controller()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get("subscription-plans")
  @ApiOperation({ summary: "List subscription plans" })
  async findPlans(@Query("all") all?: string, @Req() req?: any) {
    const user = req.user;
    const isAdmin = user?.role === "admin";
    return this.subscriptionsService.findPlans(!(all === "true" && isAdmin));
  }

  @Post("subscription-plans")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create plan (admin)" })
  async createPlan(@Body() data: any) {
    return this.subscriptionsService.createPlan(data);
  }

  @Patch("subscription-plans/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update plan (admin)" })
  async updatePlan(@Param("id") id: string, @Body() data: any) {
    return this.subscriptionsService.updatePlan(id, data);
  }

  @Delete("subscription-plans/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete plan (admin)" })
  async removePlan(@Param("id") id: string) {
    return this.subscriptionsService.softDeletePlan(id);
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
  @ApiOperation({ summary: "Get current user's subscription with plan" })
  async getMySubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getUserSubscription(user.id);
  }

  @Get("subscriptions/upgrade-plans")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get upgrade plans for current user" })
  async getUpgradePlans(@CurrentUser() user: any) {
    return this.subscriptionsService.getUpgradePlans(user.id);
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