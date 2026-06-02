import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { TranslationsService } from "./translations.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("translations")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
@Controller("translations")
export class TranslationsController {
  constructor(private translationsService: TranslationsService) {}

  @Get()
  @ApiOperation({ summary: "List translations with filters" })
  async findAll(
    @Query("locale") locale?: string,
    @Query("namespace") namespace?: string,
  ) {
    return this.translationsService.findAll({ locale, namespace });
  }

  @Post()
  @ApiOperation({ summary: "Create new translation key" })
  async create(@Body() data: any) {
    return this.translationsService.create(data);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update translation" })
  async update(
    @Param("id") id: string,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    return this.translationsService.update(id, { ...data, updatedBy: user.id });
  }

  @Post("export")
  @ApiOperation({ summary: "Export all translations to JSON" })
  async exportAll() {
    return this.translationsService.exportAll();
  }

  @Post("auto-translate")
  @ApiOperation({ summary: "AI auto-translate to new locale" })
  async autoTranslate(
    @Body("sourceLocale") sourceLocale: string,
    @Body("targetLocale") targetLocale: string,
    @Body("namespace") namespace?: string,
  ) {
    return this.translationsService.autoTranslate(sourceLocale, targetLocale, namespace);
  }
}