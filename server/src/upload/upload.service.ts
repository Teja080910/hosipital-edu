import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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

  private getImageUrlPrefix() {
    const apiUrl = this.config.get<string>("API_URL") || "http://localhost:4000";
    return `${apiUrl}/api/images`;
  }

  async generatePresignedUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const publicUrl = await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 604800 });
    return { url, key, publicUrl };
  }

  async uploadFile(key: string, contentType: string, body: Buffer) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await this.s3.send(command);
    const publicUrl = await getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 604800 });
    return { url: publicUrl, key };
  }

  async getImageUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 604800 });
  }
}