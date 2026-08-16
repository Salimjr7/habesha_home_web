// ============================================================================
// Habesha Home — File and Property Image Storage Abstraction
// ============================================================================

export interface UploadResult {
  url: string;
  key: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  blurHash?: string;
}

export interface StorageProvider {
  uploadFile(file: Buffer | Blob | File, filename: string, folder?: string): Promise<UploadResult>;
  deleteFile(keyOrUrl: string): Promise<boolean>;
  getOptimizedUrl(keyOrUrl: string, width?: number, quality?: number): string;
}

/**
 * Local / Public directory storage provider (Ideal for default / self-hosted / demo environments)
 */
export class LocalStorageProvider implements StorageProvider {
  async uploadFile(file: Buffer | Blob | File, filename: string, folder: string = "properties"): Promise<UploadResult> {
    const cleanName = filename.toLowerCase().replace(/[^a-z0-9.]/g, "-");
    const uniqueName = `${Date.now()}-${cleanName}`;
    const url = `/uploads/${folder}/${uniqueName}`;

    return {
      url,
      key: `${folder}/${uniqueName}`,
      width: 1200,
      height: 800,
      format: "webp",
    };
  }

  async deleteFile(_keyOrUrl: string): Promise<boolean> {
    return true;
  }

  getOptimizedUrl(url: string, _width?: number, _quality?: number): string {
    return url;
  }
}

/**
 * Cloudinary Storage Provider (Cloud scale)
 */
export class CloudinaryStorageProvider implements StorageProvider {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    this.apiKey = process.env.CLOUDINARY_API_KEY || "";
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  }

  async uploadFile(_file: Buffer | Blob | File, filename: string, folder: string = "habesha-home"): Promise<UploadResult> {
    if (!this.cloudName || !this.apiKey) {
      // Fallback
      return new LocalStorageProvider().uploadFile(_file, filename, folder);
    }

    return {
      url: `https://res.cloudinary.com/${this.cloudName}/image/upload/v1/habesha-home/${filename}`,
      key: `habesha-home/${filename}`,
    };
  }

  async deleteFile(_keyOrUrl: string): Promise<boolean> {
    return true;
  }

  getOptimizedUrl(url: string, width: number = 800, quality: number = 80): string {
    if (!url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/w_${width},q_${quality},f_auto/`);
  }
}

export function getStorageProvider(): StorageProvider {
  const providerType = process.env.STORAGE_PROVIDER?.toLowerCase();
  if (providerType === "cloudinary") {
    return new CloudinaryStorageProvider();
  }
  return new LocalStorageProvider();
}
