import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface UploadResult {
  urlHot: string;
  urlCold: string;
  hashFile: string;
}

class UploadService {
  private s3Client: S3Client | null = null;

  constructor() {
    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  calculateFileHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  async uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials not configured");
    }

    const formData = new FormData();
    const blob = new Blob([buffer]);
    formData.append("file", blob, filename);
    formData.append("upload_preset", "ml_default");
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);

    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest("hex");

    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  }

  async uploadToR2(buffer: Buffer, filename: string, hash: string): Promise<string> {
    if (!this.s3Client) {
      throw new Error("Cloudflare R2 not configured");
    }

    if (!process.env.R2_BUCKET_NAME) {
      throw new Error("R2_BUCKET_NAME not configured");
    }

    const key = `properties/${hash}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: this.getContentType(filename),
    });

    await this.s3Client.send(command);

    if (process.env.R2_PUBLIC_URL) {
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    }

    return `https://${process.env.R2_BUCKET_NAME}.r2.dev/${key}`;
  }

  async uploadImage(buffer: Buffer, filename: string): Promise<UploadResult> {
    const hashFile = this.calculateFileHash(buffer);

    const urlHot = await this.uploadToCloudinary(buffer, filename);
    
    let urlCold = urlHot;
    try {
      if (this.s3Client) {
        urlCold = await this.uploadToR2(buffer, filename, hashFile);
      }
    } catch (error) {
      console.warn("R2 upload failed, using Cloudinary URL as fallback:", error);
    }

    return {
      urlHot,
      urlCold,
      hashFile,
    };
  }

  private getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }
}

export const uploadService = new UploadService();
