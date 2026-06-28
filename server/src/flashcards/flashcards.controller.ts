import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { FlashcardsService } from "./flashcards.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AccountTypeGuard } from "../common/guards/account-type.guard";
import { Roles, AllowedAccountTypes } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("flashcards")
@Controller("flashcards")
export class FlashcardsController {
  constructor(private flashcardsService: FlashcardsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List flashcards with filters" })
  async findAll(
    @Query("examId") examId?: string,
    @Query("specialtyId") specialtyId?: string,
    @Query("topicId") topicId?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @CurrentUser() user?: any,
  ) {
    return this.flashcardsService.findAll({ examId, specialtyId, topicId, page, limit }, user);
  }

  @Get("specialties")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get flashcard specialties" })
  async getSpecialties(@CurrentUser() user: any) {
    return this.flashcardsService.getSpecialties(user.id);
  }

  @Get("due")
  @UseGuards(JwtAuthGuard, AccountTypeGuard)
  @AllowedAccountTypes("full")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get due flashcards for review" })
  async findDue(@CurrentUser() user: any, @Query("limit") limit?: number) {
    return this.flashcardsService.findDue(user.id, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create flashcard (admin)" })
  async create(@Body() data: any, @CurrentUser() user: any) {
    return this.flashcardsService.create({ ...data, createdBy: user.id });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update flashcard (admin)" })
  async update(@Param("id") id: string, @Body() data: any) {
    return this.flashcardsService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete flashcard (admin)" })
  async remove(@Param("id") id: string) {
    return this.flashcardsService.softDelete(id);
  }

  @Post(":id/review")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit flashcard review (SM-2)" })
  async review(
    @Param("id") id: string,
    @Body("quality") quality: number,
    @CurrentUser() user: any,
  ) {
    return this.flashcardsService.submitReview({
      userId: user.id,
      flashcardId: id,
      quality,
    });
  }
}