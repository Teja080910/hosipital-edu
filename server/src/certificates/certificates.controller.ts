import { Controller, Get, Post, Param, Body, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CertificatesService } from "./certificates.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("certificates")
@Controller("certificates")
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List user's certificates" })
  async findAll(@CurrentUser() user: any) {
    return this.certificatesService.findByUser(user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get certificate by id" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    const cert = await this.certificatesService.findById(id);
    if (cert.userId !== user.id && user.role !== "admin" && user.role !== "super_admin") {
      throw new ForbiddenException();
    }
    return cert;
  }

  @Post("generate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate certificate on course completion" })
  async generate(
    @CurrentUser() user: any,
    @Body("courseId") courseId: string,
  ) {
    return this.certificatesService.generate(user.id, courseId);
  }

  @Get("verify/:hash")
  @ApiOperation({ summary: "Public certificate verification" })
  async verify(@Param("hash") hash: string) {
    return this.certificatesService.verifyByHash(hash);
  }
}