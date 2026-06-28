import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { I18nService } from "../common/i18n/i18n.service";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private i18n: I18nService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "List all users (admin)" })
  async findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.usersService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 1000,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    if (user.role !== "admin" && user.role !== "super_admin" && user.id !== id) {
      return { message: this.i18n.t("users.accessDenied") };
    }
    return this.usersService.findById(id);
  }

  @Get(":id/referral")
  @ApiOperation({ summary: "Get user's referral info" })
  async getReferral(@Param("id") id: string, @CurrentUser() user: any) {
    if (user.role !== "admin" && user.role !== "super_admin" && user.id !== id) {
      return { message: this.i18n.t("users.accessDenied") };
    }
    return this.usersService.getReferralInfo(id);
  }

  @Get(":id/subscription")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get user subscription (admin)" })
  async getSubscription(@Param("id") id: string) {
    return this.usersService.getSubscription(id);
  }

  @Patch(":id/subscription")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Update user subscription (admin)" })
  async updateSubscription(
    @Param("id") id: string,
    @Body() data: { planId?: string; status?: string; remainingExamAttempts?: number; currentPeriodEnd?: string },
  ) {
    return this.usersService.updateSubscription(id, data);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  async update(
    @Param("id") id: string,
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false })) data: any,
    @CurrentUser() user: any,
  ) {
    if (user.role !== "admin" && user.role !== "super_admin" && user.id !== id) {
      return { message: this.i18n.t("users.accessDenied") };
    }
    return this.usersService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Soft delete user (admin)" })
  async remove(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }

  @Patch(":id/role")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Change user role (admin)" })
  async changeRole(
    @Param("id") id: string,
    @Body("role") role: string,
    @CurrentUser() admin: any,
  ) {
    return this.usersService.update(id, { role });
  }
}