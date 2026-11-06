import { z } from "zod";

export const DateRangePresetEnum = z.enum([
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_month",
  "this_quarter",
  "this_year",
  "custom"
]);
export type DateRangePreset = z.infer<typeof DateRangePresetEnum>;

export const AnalyticsTimeframeSchema = z.object({
  preset: DateRangePresetEnum.default("last_30_days"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  interval: z.enum(["hour", "day", "week", "month"]).default("day"),
});
export type AnalyticsTimeframe = z.infer<typeof AnalyticsTimeframeSchema>;

export const RevenueMetricsQuerySchema = AnalyticsTimeframeSchema.extend({
  vendorId: z.string().optional(),
  city: z.string().optional(),
  serviceCategory: z.enum(["hotel", "adventure", "bike", "cab", "tour", "all"]).default("all"),
  groupBy: z.enum(["day", "city", "category", "vendor"]).default("day"),
});
export type RevenueMetricsQuery = z.infer<typeof RevenueMetricsQuerySchema>;

export const BookingAnalyticsSummarySchema = z.object({
  totalBookings: z.number().int(),
  confirmedBookings: z.number().int(),
  cancelledBookings: z.number().int(),
  refundedBookings: z.number().int(),
  cancellationRate: z.number(), // percentage 0 - 100
  totalGrossRevenue: z.number(),
  platformCommissionRevenue: z.number(),
  vendorPayoutAmount: z.number(),
  averageBookingValue: z.number(),
  averageDailyRate: z.number().optional(),
  currency: z.string().default("INR"),
});
export type BookingAnalyticsSummary = z.infer<typeof BookingAnalyticsSummarySchema>;

export const UserGrowthCohortSchema = AnalyticsTimeframeSchema.extend({
  userType: z.enum(["customer", "vendor", "all"]).default("customer"),
});
export type UserGrowthCohort = z.infer<typeof UserGrowthCohortSchema>;

export const ExportReportFormatEnum = z.enum(["csv", "json", "pdf", "xlsx"]);
export type ExportReportFormat = z.infer<typeof ExportReportFormatEnum>;

export const ExportReportRequestSchema = z.object({
  reportType: z.enum(["revenue", "bookings", "vendor_payouts", "tax_summary", "cancellations"]),
  timeframe: AnalyticsTimeframeSchema,
  format: ExportReportFormatEnum.default("csv"),
  filters: z.record(z.string(), z.any()).optional(),
  notifyEmail: z.string().email().optional(),
});
export type ExportReportRequest = z.infer<typeof ExportReportRequestSchema>;

