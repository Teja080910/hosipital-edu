import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: "auto",
      endpoint: this.config.get<string>("R2_ENDPOINT"),
      credentials: {
        accessKeyId: this.config.get<string>("R2_ACCESS_KEY_ID") || "",
        secretAccessKey: this.config.get<string>("R2_SECRET_ACCESS_KEY") || "",
      },
    });
    this.bucket = this.config.get<string>("R2_BUCKET_NAME") || "hospital-edu";
  }

  async generatePresignedUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return { url, key };
  }
}