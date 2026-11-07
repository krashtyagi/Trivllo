export const optimizeCloudinary = (url: string, transform = "f_auto,q_auto") => {
  if (
    !url ||
    typeof url !== "string" ||
    !url.includes("res.cloudinary.com") ||
    (!url.includes("/image/upload/") && !url.includes("/upload/"))
  ) {
    return url;
  }
  const marker = url.includes("/image/upload/") ? "/image/upload/" : "/upload/";
  if (url.includes(`${marker}${transform}/`)) return url;
  return url.replace(marker, `${marker}${transform}/`);
};

