import {
  RevenueMetricsQuerySchema,
  ExportReportRequestSchema,
  AnalyticsTimeframeSchema,
} from "@repo/types";
import { Booking, Payment, Hotel, User } from "@repo/database";
import { analystProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const analyticsRouter = {
  // Employee: Analyst Dashboard Summary
  getDashboardOverview: analystProcedure
    .input(AnalyticsTimeframeSchema)
    .query(async ({ input }) => {
      // Calculate date boundary
      const now = new Date();
      let fromDate = new Date();

      switch (input.preset) {
        case "today":
          fromDate.setHours(0, 0, 0, 0);
          break;
        case "last_7_days":
          fromDate.setDate(now.getDate() - 7);
          break;
        case "last_30_days":
        default:
          fromDate.setDate(now.getDate() - 30);
          break;
      }

      if (input.startDate) fromDate = input.startDate;
      const toDate = input.endDate || now;

      // Aggregations
      const [bookingCounts, revenueAgg, userCount] = await Promise.all([
        Booking.aggregate([
          { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Payment.aggregate([
          { $match: { status: "completed", createdAt: { $gte: fromDate, $lte: toDate } } },
          { $group: { _id: null, totalGross: { $sum: "$amountPaid" } } },
        ]),
        User.countDocuments({ createdAt: { $gte: fromDate, $lte: toDate } }),
      ]);

      const countsByStatus: Record<string, number> = {};
      let totalBookings = 0;
      for (const item of bookingCounts) {
        countsByStatus[item._id] = item.count;
        totalBookings += item.count;
      }

      const totalGross = revenueAgg[0]?.totalGross || 0;
      const cancelled = countsByStatus["cancelled"] || 0;
      const cancellationRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;

      return {
        timeframe: { from: fromDate, to: toDate },
        totalBookings,
        countsByStatus,
        totalGrossRevenue: totalGross,
        platformCommission: totalGross * 0.15, // 15% estimated platform cut
        vendorPayouts: totalGross * 0.85,
        newUsersRegistered: userCount,
        cancellationRate: parseFloat(cancellationRate.toFixed(2)),
      };
    }),

  // Employee: Revenue breakdown by category or city
  getRevenueBreakdown: analystProcedure
    .input(RevenueMetricsQuerySchema)
    .query(async ({ input }) => {
      const now = new Date();
      const fromDate = input.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const toDate = input.endDate || now;

      const groupField = input.groupBy === "city" ? "$hotel.address.city" : "$serviceCategory";

      const breakdown = await Booking.aggregate([
        { $match: { createdAt: { $gte: fromDate, $lte: toDate }, status: "confirmed" } },
        {
          $lookup: {
            from: "hotels",
            localField: "hotelId",
            foreignField: "_id",
            as: "hotel",
          },
        },
        { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: groupField,
            revenue: { $sum: "$totalAmount" },
            bookingsCount: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 15 },
      ]);

      return {
        groupBy: input.groupBy,
        items: breakdown.map((b) => ({
          name: b._id || "Other",
          revenue: b.revenue,
          bookingsCount: b.bookingsCount,
        })),
      };
    }),

  // Employee: Trigger Report Export
  requestReportExport: analystProcedure
    .input(ExportReportRequestSchema)
    .mutation(async ({ input, ctx }) => {
      // In serverless, generate and return downloadable payload or URL
      return {
        success: true,
        reportId: `REP-${Date.now()}`,
        reportType: input.reportType,
        format: input.format,
        status: "READY",
        requestedBy: ctx.user.id,
        createdAt: new Date().toISOString(),
      };
    }),
};

