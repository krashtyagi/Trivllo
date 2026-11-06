export type ImageTransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "limit" | "thumb" | "scale" | "fit" | "crop";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  dpr?: "auto" | number;
};

/**
 * Optimizes Cloudinary and Unsplash URLs using Core Transformation Parameters.
 * - f_auto: Automatically delivers WebP/AVIF depending on the client browser.
 * - q_auto: Perceptual quality compression reducing file size up to 80% with zero visible degradation.
 * - w_{width}, h_{height}, c_{crop}: Resizes to exact container dimensions.
 */
export function optimizeCloudinaryUrl(
  url: string | any | undefined | null,
  options: ImageTransformOptions = {}
): string {
  if (!url) return "/hotels/room1.png";

  const src = typeof url === "string" ? url : (url?.src || "");
  if (!src) return "/hotels/room1.png";

  // 1. Unsplash URL optimization
  if (src.includes("images.unsplash.com")) {
    const { width = 600, quality = 75 } = options;
    try {
      const u = new URL(src);
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", typeof quality === "number" ? String(quality) : "75");
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    } catch {
      return src;
    }
  }

  // 2. Cloudinary URL optimization
  if (src.includes("res.cloudinary.com") && (src.includes("/image/upload/") || src.includes("/upload/"))) {
    const {
      width,
      height,
      crop = width && height ? "fill" : "limit",
      quality = "auto",
      format = "auto",
      dpr = "auto",
    } = options;

    const transformSegments: string[] = [
      `f_${format}`,
      `q_${quality}`,
      `dpr_${dpr}`,
    ];

    if (width) transformSegments.push(`w_${width}`);
    if (height) transformSegments.push(`h_${height}`);
    if (crop && (width || height)) transformSegments.push(`c_${crop}`);

    const newTransforms = transformSegments.join(",");

    const uploadMarker = src.includes("/image/upload/") ? "/image/upload/" : "/upload/";
    const markerIndex = src.indexOf(uploadMarker);
    if (markerIndex === -1) return src;

    const prefix = src.substring(0, markerIndex + uploadMarker.length);
    const afterUpload = src.substring(markerIndex + uploadMarker.length);

    // If already has transformation parameters right after /upload/, replace them
    // Pattern matches existing transforms like c_fill,w_300/v12345/... or f_auto,q_auto/v12345/...
    const transformRegex = /^(?:([a-zA-Z0-9_,:-]+)\/)?(v\d+\/.*|[^\/]+$)/;
    const match = afterUpload.match(transformRegex);

    if (match && match[2]) {
      return `${prefix}${newTransforms}/${match[2]}`;
    }

    return `${prefix}${newTransforms}/${afterUpload}`;
  }

  return src;
}

// Preset configurations for common responsive UI components
export const IMAGE_PRESETS = {
  // Main hotel / tour card in carousel (~240-270px width on screens, 2x retina = 500w)
  carouselCard: {
    width: 500,
    height: 350,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Small thumbnail photo (e.g. jumbled cluster thumbnail ~70px, 2x retina = 150w)
  miniThumb: {
    width: 150,
    height: 110,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Card background in MoreStaysCard
  cardBackground: {
    width: 650,
    height: 480,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Full detail banner / large view
  banner: {
    width: 1000,
    crop: "limit" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Hero Ranked Banner on Home/Explore pages
  rankedBanner: {
    width: 1400,
    height: 750,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Detail page main featured image
  detailGalleryMain: {
    width: 1200,
    height: 800,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Detail page gallery grid thumbnails
  detailGalleryThumb: {
    width: 600,
    height: 450,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Detail page drawer view thumbnails
  detailDrawerThumb: {
    width: 700,
    height: 500,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Detail page high-res zoom view (compressed WebP/AVIF without multi-megabyte weight)
  detailZoomHighRes: {
    width: 1920,
    height: 1200,
    crop: "limit" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
  // Room card & tour package card preview
  roomCardThumb: {
    width: 600,
    height: 450,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "auto" as const,
  },
};
