import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo.config";

/**
 * Dynamic robots.txt generation via Next.js Metadata API.
 * Tells search engines what to crawl and links to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth-callback/",
          "/profile/",
          "/book/",
          "/booknow/",
          "/login/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/auth-callback/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
