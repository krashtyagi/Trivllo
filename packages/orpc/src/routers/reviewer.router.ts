import {
  ModerateReviewSchema,
  ReviewFilterSchema,
  PropertyApprovalDecisionSchema,
  CreateReviewSchema,
} from "@repo/types";
import { Review, Hotel, Vendor } from "@repo/database";
import { reviewerProcedure, authProcedure, publicProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const reviewerRouter = {
  // Public: Get reviews for a property
  getPropertyReviews: publicProcedure
    .input(z.object({
      targetId: z.string(),
      targetType: z.enum(["hotel", "adventure", "bike", "cab", "tour"]).default("hotel"),
      page: z.number().int().default(1),
      limit: z.number().int().default(10),
    }))
    .query(async ({ input }) => {
      const query = {
        targetId: input.targetId,
        targetType: input.targetType,
        status: "approved",
      };

      const total = await Review.countDocuments(query);
      const reviews = await Review.find(query)
        .populate("userId", "firstName lastName avatar")
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        reviews,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // User: Submit review
  submitReview: authProcedure
    .input(CreateReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const review = await Review.create({
        ...input,
        userId: ctx.user.id,
        status: "pending", // All reviews enter moderation queue
      });

      return { success: true, reviewId: review._id };
    }),

  // Employee: Reviewer Queue
  getModerationQueue: reviewerProcedure
    .input(ReviewFilterSchema)
    .query(async ({ input }) => {
      const query: Record<string, any> = {};
      if (input.status) query.status = input.status;
      if (input.targetType) query.targetType = input.targetType;
      if (input.targetId) query.targetId = input.targetId;
      if (input.flaggedOnly) query.status = "flagged_spam";

      const total = await Review.countDocuments(query);
      const reviews = await Review.find(query)
        .populate("userId", "firstName lastName email")
        .sort({ [input.sortBy]: input.sortOrder === "desc" ? -1 : 1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        reviews,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Employee: Moderate review
  moderateReview: reviewerProcedure
    .input(ModerateReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const review = await Review.findById(input.reviewId);
      if (!review) throw new ORPCError("Review not found", "NOT_FOUND");

      review.status = input.status;
      review.moderatedBy = ctx.user.id;
      review.moderatedAt = new Date();
      if (input.rejectionReason) review.rejectionReason = input.rejectionReason;
      if (input.moderationNotes) review.moderationNotes = input.moderationNotes;

      await review.save();

      return { success: true, review };
    }),

  // Employee: Review Vendor Property Approval
  decidePropertyApproval: reviewerProcedure
    .input(PropertyApprovalDecisionSchema)
    .mutation(async ({ input, ctx }) => {
      const hotel = await Hotel.findById(input.propertyId);
      if (!hotel) throw new ORPCError("Property not found", "NOT_FOUND");

      const statusMap = {
        approve: "approved",
        reject: "rejected",
        request_changes: "pending_approval",
      };

      hotel.status = statusMap[input.action];
      hotel.reviewerFeedback = input.feedback;
      hotel.reviewedBy = ctx.user.id;
      hotel.reviewedAt = new Date();

      await hotel.save();

      return { success: true, propertyStatus: hotel.status };
    }),
};

