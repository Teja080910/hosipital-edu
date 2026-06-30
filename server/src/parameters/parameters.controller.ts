import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ParametersService } from "./parameters.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("parameters")
@Controller()
export class ParametersController {
  constructor(private parametersService: ParametersService) {}

  @Get("parameters")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all system parameters" })
  async findAll() {
    return this.parametersService.findAll();
  }

  @Get("parameters/:key")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get parameter by key" })
  async findOne(@Param("key") key: string) {
    return this.parametersService.findByKey(key);
  }

  @Post("parameters")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create parameter (admin)" })
  async create(@Body() data: { key: string; value: any; description?: string }, @CurrentUser() user: any) {
    return this.parametersService.create({ ...data, updatedBy: user.id });
  }

  @Patch("parameters/:key")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update parameter (admin)" })
  async update(@Param("key") key: string, @Body() data: { value?: any; description?: string }, @CurrentUser() user: any) {
    return this.parametersService.update(key, { ...data, updatedBy: user.id });
  }

  @Delete("parameters/:key")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete parameter (admin)" })
  async remove(@Param("key") key: string) {
    return this.parametersService.remove(key);
  }
}