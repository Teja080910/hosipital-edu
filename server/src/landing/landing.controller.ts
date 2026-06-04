import { Controller, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LandingService } from "./landing.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("landing")
@Controller("landing")
export class LandingController {
  constructor(private landingService: LandingService) {}

  @Get()
  @ApiOperation({ summary: "Get active landing page config" })
  async findAll() {
    return this.landingService.findAll();
  }

  @Put(":section")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update landing page section (admin)" })
  async update(@Param("section") section: string, @Body("config") config: any) {
    return this.landingService.updateSection(section, config);
  }
}