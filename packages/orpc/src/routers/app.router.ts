import { blogRouter } from "./blog.router";
import { reviewerRouter } from "./reviewer.router";
import { seoRouter } from "./seo.router";
import { analyticsRouter } from "./analytics.router";
import { hotelRouter } from "./hotel.router";
import { bookingRouter } from "./booking.router";
import { vendorRouter } from "./vendor.router";
import { userRouter } from "./user.router";

export const appRouter = {
  // Employee Role Specific Routers
  blog: blogRouter,
  reviewer: reviewerRouter,
  seo: seoRouter,
  analytics: analyticsRouter,

  // Domain Specific Routers
  hotel: hotelRouter,
  booking: bookingRouter,
  vendor: vendorRouter,
  user: userRouter,
};

export type AppRouter = typeof appRouter;

