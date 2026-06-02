import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { VideosService } from "./videos.service";

@ApiTags("videos")
@Controller("videos")
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: "List all video modules with lessons" })
  async findAll() {
    return this.videosService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get video module with lessons" })
  async findOne(@Param("id") id: string) {
    return this.videosService.findById(id);
  }
}