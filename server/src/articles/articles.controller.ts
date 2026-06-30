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
  Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ArticlesService } from "./articles.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { IsOptional, IsString, IsBoolean, IsUUID } from "class-validator";

class CreateArticleDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

@ApiTags("articles")
@Controller("articles")
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List articles" })
  async findAll(
    @Query("categoryId") categoryId?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("all") all?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user?.role === "admin";
    return this.articlesService.findAll({ categoryId, page, limit, publishedOnly: !(all === "true" && isAdmin) });
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get single article by slug" })
  async findOne(@Param("slug") slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create article (admin)" })
  async create(@Body() data: CreateArticleDto, @CurrentUser() user: any) {
    return this.articlesService.create({ ...data, authorId: user.id });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update article (admin)" })
  async update(@Param("id") id: string, @Body() data: UpdateArticleDto) {
    return this.articlesService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete article (admin)" })
  async remove(@Param("id") id: string) {
    return this.articlesService.softDelete(id);
  }
}