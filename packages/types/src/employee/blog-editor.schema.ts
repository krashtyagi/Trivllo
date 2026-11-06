import { z } from "zod";

export const BlogStatusEnum = z.enum(["draft", "in_review", "published", "archived", "rejected"]);
export type BlogStatus = z.infer<typeof BlogStatusEnum>;

export const CreateBlogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-safe lowercase with hyphens"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(20, "Content cannot be empty"), // JSON string (Lexical) or HTML
  featuredImage: z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }).optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  authorId: z.string().optional(),
  status: BlogStatusEnum.default("draft"),
  seo: z.object({
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeywords: z.array(z.string()).default([]),
    canonicalUrl: z.string().url().optional(),
    noIndex: z.boolean().default(false),
  }).optional(),
  scheduledPublishAt: z.coerce.date().optional(),
});
export type CreateBlogPostInput = z.infer<typeof CreateBlogPostSchema>;

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial().extend({
  id: z.string().min(1),
  revisionNote: z.string().max(200).optional(),
});
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostSchema>;

export const BlogQueryFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  status: BlogStatusEnum.optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "publishedAt", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type BlogQueryFilter = z.infer<typeof BlogQueryFilterSchema>;

export const BlogCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  description: z.string().max(300).optional(),
  icon: z.string().optional(),
});
export type BlogCategoryInput = z.infer<typeof BlogCategorySchema>;

export const BlogMediaUploadSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});
export type BlogMediaUploadInput = z.infer<typeof BlogMediaUploadSchema>;

