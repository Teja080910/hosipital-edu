import {
  BadRequestException,
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
import { ConfigService } from "@nestjs/config";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { SubscriptionsService } from "./subscriptions.service";
import Stripe from "stripe";
import { Inject } from "@nestjs/common";
import { STRIPE } from "./stripe.provider";
import { IsOptional, IsString, IsNumber, IsBoolean, IsObject, IsUUID } from "class-validator";

class CreatePlanDto {
  @IsObject()
  name!: object;

  @IsOptional()
  @IsObject()
  description?: object;

  @IsNumber()
  price!: number;

  @IsString()
  interval!: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isCourseOnly?: boolean;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsNumber()
  maxDays?: number;

  @IsOptional()
  @IsNumber()
  examAttempts?: number;

  @IsOptional()
  @IsNumber()
  flashcardAttempts?: number;

  @IsOptional()
  @IsNumber()
  maxCourses?: number;
}

class UpdatePlanDto {
  @IsOptional()
  @IsObject()
  name?: object;

  @IsOptional()
  @IsObject()
  description?: object;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  interval?: string;

  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isCourseOnly?: boolean;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsNumber()
  maxDays?: number;

  @IsOptional()
  @IsNumber()
  examAttempts?: number;

  @IsOptional()
  @IsNumber()
  flashcardAttempts?: number;

  @IsOptional()
  @IsNumber()
  maxCourses?: number;
}

@ApiTags("subscriptions")
@Controller()
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    @Inject(STRIPE) private stripe: Stripe,
    private config: ConfigService,
  ) {}

  @Get("subscription-plans")
  @ApiOperation({ summary: "List subscription plans" })
  async findPlans(@Query("all") all?: string, @CurrentUser() user?: any) {
    const isAdmin = user?.role === "admin";
    return this.subscriptionsService.findPlans(!(all === "true" && isAdmin));
  }

  @Post("subscription-plans")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create plan (admin)" })
  async createPlan(@Body() data: CreatePlanDto) {
    return this.subscriptionsService.createPlan(data);
  }

  @Patch("subscription-plans/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update plan (admin)" })
  async updatePlan(@Param("id") id: string, @Body() data: UpdatePlanDto) {
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
    @Body("locale") locale: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.createCheckoutSession(user.id, planId, locale || "en");
  }

  @Post("subscriptions/confirm-checkout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm checkout after Stripe redirect" })
  async confirmCheckout(
    @Body("sessionId") sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.confirmCheckout(sessionId, user.id);
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
    const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new BadRequestException("Webhook secret not configured");
    }
    let event: Stripe.Event;
    try {
      const rawBody = req.rawBody || JSON.stringify(req.body);
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException("Invalid webhook signature");
    }
    return this.subscriptionsService.handleWebhook(event);
  }
}