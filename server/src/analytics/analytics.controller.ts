import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get("user-stats")
  @UseGuards(AccountTypeGuard)
  @AllowedAccountTypes("full")
  @ApiOperation({ summary: "Get current user's stats" })
  async getUserStats(@CurrentUser() user: any) {
    return this.analyticsService.getUserStats(user.id);
  }

  @Get("progress")
  @UseGuards(AccountTypeGuard)
  @AllowedAccountTypes("full")
  @ApiOperation({ summary: "Get current user's progress dashboard data" })
  async getUserProgress(@CurrentUser() user: any) {
    return this.analyticsService.getUserProgress(user.id);
  }

  @Get("admin")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get admin dashboard stats" })
  async getAdminStats() {
    return this.analyticsService.getAdminStats();
  }

  @Get("admin/dau")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get daily active users" })
  async getDailyActiveUsers(@Query("days") days?: number) {
    return this.analyticsService.getDailyActiveUsers(days || 30);
  }

  @Get("admin/mau")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get monthly active users" })
  async getMonthlyActiveUsers(@Query("months") months?: number) {
    return this.analyticsService.getMonthlyActiveUsers(months || 12);
  }

  @Get("admin/retention")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get cohort retention data" })
  async getCohortRetention() {
    return this.analyticsService.getCohortRetention();
  }

  @Get("admin/user-growth")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get user growth over time" })
  async getUserGrowth(@Query("days") days?: number) {
    return this.analyticsService.getUserGrowth(days || 30);
  }

  @Get("admin/exam-completion")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get exam completion stats" })
  async getExamCompletionStats() {
    return this.analyticsService.getExamCompletionStats();
  }
}