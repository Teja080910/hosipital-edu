import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ExamsService } from "./exams.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";

@ApiTags("exams")
@Controller("exams")
export class ExamsController {
  constructor(private examsService: ExamsService) {}

  @Get()
  @ApiOperation({ summary: "List all active exams" })
  async findAll() {
    return this.examsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get exam with specialties" })
  async findOne(@Param("id") id: string) {
    return this.examsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create exam (admin)" })
  async create(@Body() data: any) {
    return this.examsService.create(data);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update exam (admin)" })
  async update(@Param("id") id: string, @Body() data: any) {
    return this.examsService.update(id, data);
  }
}