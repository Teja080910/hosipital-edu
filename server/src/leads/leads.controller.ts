import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LeadsService } from "./leads.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@ApiTags("leads")
@Controller("leads")
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: "Capture a new lead from landing page" })
  async create(@Body() body: { email: string; name?: string; source?: string; locale?: string }) {
    return this.leadsService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all leads (admin)" })
  async findAll() {
    return this.leadsService.findAll();
  }
}
