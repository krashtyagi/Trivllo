import { z } from "zod";

export const SeoPageTypeEnum = z.enum([
  "home",
  "hotel_detail",
  "hotel_search",
  "tour_detail",
  "tour_search",
  "blog_post",
  "blog_category",
  "landing_page",
  "custom"
]);
export type SeoPageType = z.infer<typeof SeoPageTypeEnum>;

export const SeoMetadataSchema = z.object({
  id: z.string().optional(),
  path: z.string().min(1, "URL path is required"),
  pageType: SeoPageTypeEnum.default("custom"),
  title: z.string().min(10, "Title should be at least 10 chars").max(70, "Title should stay under 70 chars"),
  description: z.string().min(50, "Description should be informative").max(160, "Description should stay under 160 chars"),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  ogImage: z.string().url().optional(),
  ogType: z.string().default("website"),
  structuredDataJson: z.string().optional(), // JSON-LD payload string
  focusKeyword: z.string().optional(),
  updatedByEmployeeId: z.string().optional(),
});
export type SeoMetadataInput = z.infer<typeof SeoMetadataSchema>;

export const GoogleIndexingRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100),
  action: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
  reason: z.string().optional(),
});
export type GoogleIndexingRequestInput = z.infer<typeof GoogleIndexingRequestSchema>;

export const UrlRedirectRuleSchema = z.object({
  id: z.string().optional(),
  sourcePath: z.string().min(1, "Source path is required"),
  destinationPath: z.string().min(1, "Destination path is required"),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).default(301),
  isActive: z.boolean().default(true),
  notes: z.string().max(300).optional(),
});
export type UrlRedirectRuleInput = z.infer<typeof UrlRedirectRuleSchema>;

export const SeoAuditResultSchema = z.object({
  url: z.string().url(),
  score: z.number().min(0).max(100),
  titleLength: z.number(),
  descriptionLength: z.number(),
  hasH1: z.boolean(),
  h1Count: z.number(),
  imagesWithoutAlt: z.number(),
  canonicalMatchesSelf: z.boolean(),
  indexable: z.boolean(),
  issues: z.array(z.object({
    severity: z.enum(["low", "medium", "high", "critical"]),
    message: z.string(),
    suggestion: z.string().optional(),
  })),
});
export type SeoAuditResult = z.infer<typeof SeoAuditResultSchema>;

