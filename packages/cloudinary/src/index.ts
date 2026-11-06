import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

let isConfigured = false;

export function configureCloudinary() {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
  }
  return cloudinary;
}

export interface DirectUploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder?: string;
}

/**
 * Generate a signed signature for secure direct browser-to-Cloudinary uploads
 */
export function generateUploadSignature(options?: {
  folder?: string;
  tags?: string[];
  transformation?: string;
}): DirectUploadSignature {
  configureCloudinary();
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error("Missing Cloudinary environment variables (CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME)");
  }

  const paramsToSign: Record<string, any> = {
    timestamp,
    ...(options?.folder ? { folder: options.folder } : {}),
    ...(options?.tags ? { tags: options.tags.join(",") } : {}),
    ...(options?.transformation ? { transformation: options.transformation } : {}),
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder: options?.folder,
  };
}

/**
 * Upload buffer or data URL to Cloudinary on the server
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options?: UploadApiOptions
): Promise<UploadApiResponse> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    if (typeof file === "string") {
      cloudinary.uploader.upload(file, options || {}, (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve(result);
      });
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        options || {},
        (error, result) => {
          if (error || !result) return reject(error || new Error("Cloudinary stream upload failed"));
          resolve(result);
        }
      );
      uploadStream.end(file);
    }
  });
}

/**
 * Delete asset from Cloudinary by public ID
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> {
  configureCloudinary();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Helper to construct an optimized CDN delivery URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string | number }
): string {
  configureCloudinary();
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: options?.quality || "auto",
    width: options?.width,
    height: options?.height,
    crop: options?.crop || "limit",
    secure: true,
  });
}

export { cloudinary };

