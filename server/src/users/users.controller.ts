import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "List all users (admin)" })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    if (user.role !== "admin" && user.id !== id) {
      return { message: "Access denied" };
    }
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  async update(
    @Param("id") id: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    if (user.role !== "admin" && user.id !== id) {
      return { message: "Access denied" };
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