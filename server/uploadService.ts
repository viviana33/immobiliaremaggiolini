import crypto from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

interface UploadResult {
  urlHot: string;
  urlCold: string;
  hashFile: string;
}

interface PostImageUploadResult {
  hot_url: string;
  cold_key: string;
  file_hash: string;
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
        maxAttempts: 3,
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
    
    const timestamp = Math.round(Date.now() / 1000);
    
    // Generate signature with all required parameters
    const paramsToSign = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
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
    // Ridimensiona a max 1920px per ottimizzare memoria e upload
    const resizedBuffer = await this.resizeImage(buffer, 1920);
    const hashFile = this.calculateFileHash(resizedBuffer);

    const urlHot = await this.uploadToCloudinary(resizedBuffer, filename);
    
    let urlCold = urlHot;
    try {
      if (this.s3Client) {
        urlCold = await this.uploadToR2(resizedBuffer, filename, hashFile);
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

  async resizeImage(buffer: Buffer, maxSize: number = 2560): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error("INVALID_IMAGE: Il file non è un'immagine valida");
      }

      const longestSide = Math.max(metadata.width, metadata.height);
      const format = metadata.format;
      
      let processedImage = image;
      
      if (longestSide > maxSize) {
        const resizeOptions = metadata.width > metadata.height
          ? { width: maxSize }
          : { height: maxSize };
        
        processedImage = image.resize({ ...resizeOptions, fit: 'inside', withoutEnlargement: true });
      }
      
      // Usa qualità 85% per un buon compromesso tra dimensione e qualità
      if (format === 'jpeg' || format === 'jpg') {
        return await processedImage.jpeg({ quality: 85, progressive: true }).toBuffer();
      } else if (format === 'png') {
        // Converti PNG in JPEG per ridurre dimensione (a meno che non sia trasparente)
        return await processedImage.jpeg({ quality: 85, progressive: true }).toBuffer();
      } else if (format === 'webp') {
        return await processedImage.webp({ quality: 85 }).toBuffer();
      } else if (format === 'gif') {
        return await processedImage.gif().toBuffer();
      }
      
      return await processedImage.jpeg({ quality: 85, progressive: true }).toBuffer();
    } catch (error: any) {
      if (error.message?.includes('INVALID_IMAGE:')) {
        throw error;
      }
      if (error.message?.includes('unsupported') || error.message?.includes('Input buffer')) {
        throw new Error('INVALID_IMAGE: Il file non è un formato immagine valido o è corrotto');
      }
      throw new Error('INVALID_IMAGE: Errore nell\'elaborazione dell\'immagine');
    }
  }

  generateCloudinaryFetchUrl(coldUrl: string, transformations: string = "f_auto,q_auto,w_1600"): string {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary cloud name not configured");
    }

    const encodedUrl = encodeURIComponent(coldUrl);
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/${transformations}/${coldUrl}`;
  }

  extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
    if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
      return null;
    }

    if (cloudinaryUrl.includes('/image/fetch/')) {
      return null;
    }

    const urlPattern = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i;
    const match = cloudinaryUrl.match(urlPattern);
    
    if (match && match[1]) {
      return match[1];
    }

    return null;
  }

  async deleteFromCloudinary(cloudinaryUrl: string): Promise<boolean> {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME || 
          !process.env.CLOUDINARY_API_KEY || 
          !process.env.CLOUDINARY_API_SECRET) {
        console.warn("Cloudinary credentials not configured, skipping deletion");
        return false;
      }

      const publicId = this.extractPublicIdFromUrl(cloudinaryUrl);
      
      if (!publicId) {
        console.warn(`Could not extract public_id from URL: ${cloudinaryUrl}`);
        return false;
      }

      const timestamp = Math.round(Date.now() / 1000);
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
      const signature = crypto
        .createHash("sha1")
        .update(stringToSign)
        .digest("hex");

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", process.env.CLOUDINARY_API_KEY);
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error(`Cloudinary deletion failed for ${publicId}: ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      return data.result === "ok";
    } catch (error: any) {
      console.error(`Error deleting from Cloudinary: ${error.message}`);
      return false;
    }
  }

  async uploadPostImage(buffer: Buffer, filename: string): Promise<PostImageUploadResult> {
    const resizedBuffer = await this.resizeImage(buffer, 2560);
    const fileHash = this.calculateFileHash(resizedBuffer);

    if (!this.s3Client || !process.env.R2_BUCKET_NAME) {
      console.warn("R2 storage not configured, using Cloudinary-only fallback for post images");
      const cloudinaryUrl = await this.uploadToCloudinary(resizedBuffer, filename);
      return {
        hot_url: cloudinaryUrl,
        cold_key: `cloudinary-fallback/${fileHash}/${filename}`,
        file_hash: fileHash,
      };
    }

    const key = `posts/${fileHash}/${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: resizedBuffer,
        ContentType: this.getContentType(filename),
      });

      await this.s3Client.send(command);

      const coldUrl = process.env.R2_PUBLIC_URL
        ? `${process.env.R2_PUBLIC_URL}/${key}`
        : `https://${process.env.R2_BUCKET_NAME}.r2.dev/${key}`;

      const hotUrl = this.generateCloudinaryFetchUrl(coldUrl, "f_auto,q_auto,w_1600");

      return {
        hot_url: hotUrl,
        cold_key: key,
        file_hash: fileHash,
      };
    } catch (error: any) {
      console.error("Error uploading to R2, falling back to Cloudinary-only:", error.message);
      const cloudinaryUrl = await this.uploadToCloudinary(resizedBuffer, filename);
      return {
        hot_url: cloudinaryUrl,
        cold_key: `cloudinary-fallback/${fileHash}/${filename}`,
        file_hash: fileHash,
      };
    }
  }
}

export const uploadService = new UploadService();
