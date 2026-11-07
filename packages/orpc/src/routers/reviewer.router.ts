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
      const review: any = await Review.create({
        ...input,
        userId: ctx.user.id,
        isFlagged: false,
      } as any);

      return { success: true, reviewId: review._id };
    }),

  // Employee: Reviewer Queue
  getModerationQueue: reviewerProcedure
    .input(ReviewFilterSchema)
    .query(async ({ input }) => {
      const query: Record<string, any> = {};
      if (input.status) query.isFlagged = input.status === "flagged_spam";
      if (input.targetType) query.companyType = input.targetType;
      if (input.targetId) query.companyId = input.targetId;
      if (input.flaggedOnly) query.isFlagged = true;

      const total = await Review.countDocuments(query);
      const reviews = await Review.find(query)
        .populate("userId", "firstName lastName email")
        .sort({ [input.sortBy || "createdAt"]: input.sortOrder === "desc" ? -1 : 1 })
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
      const review = await Review.findById(input.reviewId) as any;
      if (!review) throw new ORPCError("Review not found", "NOT_FOUND");

      review.isFlagged = input.status === "rejected";
      if (input.rejectionReason) review.flagReason = input.rejectionReason;

      await review.save();

      return { success: true, review };
    }),

  // Employee: Review Vendor Property Approval
  decidePropertyApproval: reviewerProcedure
    .input(PropertyApprovalDecisionSchema)
    .mutation(async ({ input, ctx }) => {
      const hotel = await Hotel.findById(input.propertyId) as any;
      if (!hotel) throw new ORPCError("Property not found", "NOT_FOUND");

      const statusMap: Record<string, string> = {
        approve: "verified",
        reject: "rejected",
        request_changes: "pending",
      };

      hotel.verificationStatus = statusMap[input.action] || "pending";
      await hotel.save();

      return { success: true, propertyStatus: hotel.verificationStatus };
    }),
};

