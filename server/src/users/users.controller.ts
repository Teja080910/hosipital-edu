import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { I18nService } from "../common/i18n/i18n.service";
import { UsersService } from "./users.service";
import { IsOptional, IsString, IsEmail } from "class-validator";

class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  targetExamId?: string | null;

}

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
      throw new ForbiddenException(this.i18n.t("users.accessDenied"));
    }
    return this.usersService.findById(id);
  }

  @Get(":id/referral")
  @ApiOperation({ summary: "Get user's referral info" })
  async getReferral(@Param("id") id: string, @CurrentUser() user: any) {
    if (user.role !== "admin" && user.role !== "super_admin" && user.id !== id) {
      throw new ForbiddenException(this.i18n.t("users.accessDenied"));
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
    @Body() data: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== "admin" && user.role !== "super_admin" && user.id !== id) {
      throw new ForbiddenException(this.i18n.t("users.accessDenied"));
    }
    return this.usersService.update(id, data as any, user);
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
    const validRoles = ["admin", "super_admin", "student"];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }
    if (role === "super_admin" && admin.role !== "super_admin") {
      throw new ForbiddenException("Only super_admins can assign the super_admin role");
    }
    if (role === "super_admin" && admin.id === id) {
      throw new ForbiddenException("Cannot self-promote to super_admin");
    }
    return this.usersService.update(id, { role });
  }
}