import {
  SeoMetadataSchema,
  GoogleIndexingRequestSchema,
  UrlRedirectRuleSchema,
} from "@repo/types";
import { Redirect } from "@repo/database";
import { seoProcedure, publicProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const seoRouter = {
  // Public: Check redirect for incoming path
  getRedirectForPath: publicProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ input }) => {
      const redirect = await Redirect.findOne({
        sourcePath: input.path,
        isActive: true,
      }).lean();

      return redirect || null;
    }),

  // Employee: SEO Manager Procedures
  getRedirectsList: seoProcedure
    .input(z.object({
      page: z.number().int().default(1),
      limit: z.number().int().default(20),
    }))
    .query(async ({ input }) => {
      const total = await Redirect.countDocuments();
      const redirects = await Redirect.find()
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        redirects,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  createOrUpdateRedirect: seoProcedure
    .input(UrlRedirectRuleSchema)
    .mutation(async ({ input }) => {
      if (input.id) {
        const updated = await Redirect.findByIdAndUpdate(input.id, input, { new: true });
        return { success: true, redirect: updated };
      }

      const created = await Redirect.create(input);
      return { success: true, redirect: created };
    }),

  deleteRedirect: seoProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await Redirect.findByIdAndDelete(input.id);
      return { success: true };
    }),

  // Submit URLs to Google Indexing API
  submitToGoogleIndexing: seoProcedure
    .input(GoogleIndexingRequestSchema)
    .mutation(async ({ input, ctx }) => {
      // In Next.js serverless, we can call Google Indexing API or queue the request
      return {
        success: true,
        submittedUrls: input.urls,
        action: input.action,
        status: "QUEUED",
        submittedBy: ctx.user.id,
        timestamp: new Date().toISOString(),
      };
    }),

  // Run quick on-page SEO analysis
  auditPageSeo: seoProcedure
    .input(z.object({
      url: z.string().url(),
      title: z.string(),
      description: z.string(),
      focusKeyword: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const issues: Array<{ severity: "low" | "medium" | "high" | "critical"; message: string }> = [];
      let score = 100;

      if (input.title.length < 30) {
        issues.push({ severity: "medium", message: "Title is too short (< 30 characters)." });
        score -= 15;
      } else if (input.title.length > 60) {
        issues.push({ severity: "low", message: "Title may be truncated in search results (> 60 characters)." });
        score -= 5;
      }

      if (input.description.length < 70) {
        issues.push({ severity: "medium", message: "Meta description is too short (< 70 characters)." });
        score -= 20;
      } else if (input.description.length > 160) {
        issues.push({ severity: "low", message: "Meta description exceeds recommended 160 characters." });
        score -= 5;
      }

      if (input.focusKeyword) {
        const keyword = input.focusKeyword.toLowerCase();
        if (!input.title.toLowerCase().includes(keyword)) {
          issues.push({ severity: "high", message: `Focus keyword "${input.focusKeyword}" is missing from title.` });
          score -= 20;
        }
        if (!input.description.toLowerCase().includes(keyword)) {
          issues.push({ severity: "medium", message: `Focus keyword "${input.focusKeyword}" is missing from meta description.` });
          score -= 10;
        }
      }

      return {
        score: Math.max(score, 0),
        titleLength: input.title.length,
        descriptionLength: input.description.length,
        issues,
      };
    }),
};

