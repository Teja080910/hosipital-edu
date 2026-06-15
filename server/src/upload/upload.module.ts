import { Module } from "@nestjs/common";
import { UploadController, ImagesController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  controllers: [UploadController, ImagesController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}