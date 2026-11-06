import { z } from "zod";

export const ReviewModerationStatusEnum = z.enum([
  "pending",
  "approved",
  "rejected",
  "flagged_spam",
  "under_investigation"
]);
export type ReviewModerationStatus = z.infer<typeof ReviewModerationStatusEnum>;

export const ReviewTypeEnum = z.enum(["hotel", "room", "adventure", "bike", "cab", "tour"]);
export type ReviewType = z.infer<typeof ReviewTypeEnum>;

export const ModerateReviewSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  status: ReviewModerationStatusEnum,
  rejectionReason: z.string().max(500).optional(),
  moderationNotes: z.string().max(1000).optional(),
  reviewerEmployeeId: z.string().optional(),
});
export type ModerateReviewInput = z.infer<typeof ModerateReviewSchema>;

export const ReviewRatingBreakdownSchema = z.object({
  cleanliness: z.number().min(1).max(5),
  accuracy: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  location: z.number().min(1).max(5),
  checkIn: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  overall: z.number().min(1).max(5),
});
export type ReviewRatingBreakdown = z.infer<typeof ReviewRatingBreakdownSchema>;

export const CreateReviewSchema = z.object({
  bookingId: z.string().min(1),
  targetId: z.string().min(1), // Hotel ID, Tour ID, etc.
  targetType: ReviewTypeEnum,
  ratings: ReviewRatingBreakdownSchema,
  comment: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(10).default([]),
  title: z.string().max(100).optional(),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const ReviewFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  status: ReviewModerationStatusEnum.optional(),
  targetType: ReviewTypeEnum.optional(),
  targetId: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional(),
  flaggedOnly: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "rating", "reportedCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ReviewFilterInput = z.infer<typeof ReviewFilterSchema>;

export const PropertyApprovalDecisionSchema = z.object({
  propertyId: z.string().min(1),
  action: z.enum(["approve", "reject", "request_changes"]),
  feedback: z.string().min(5).max(1500),
  checkedItems: z.object({
    documentsVerified: z.boolean().default(false),
    amenitiesVerified: z.boolean().default(false),
    photosQualityApproved: z.boolean().default(false),
    pricingReasonable: z.boolean().default(false),
    addressConfirmed: z.boolean().default(false),
  }),
});
export type PropertyApprovalDecisionInput = z.infer<typeof PropertyApprovalDecisionSchema>;

