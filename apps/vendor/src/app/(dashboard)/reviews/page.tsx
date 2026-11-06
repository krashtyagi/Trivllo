"use client";

import { Suspense } from "react";
import { CustomerReviewsSection } from "./_components/customer-review-card";
import { OverallRating } from "./_components/overall-rating";
import { ReviewStatistics } from "./_components/review-statics";
import { ErrorBoundary } from "react-error-boundary";
import { MessageModal } from "../(categories)/rooms/_components/RoomsListing";
import { PageSkeleton } from "../(categories)/rooms/_components/details.skeleton";
import { useGetVendorReviews } from "./hooks/useVendorReviews";

const ReviewsPageContent = () => {
  const { data, isLoading, error } = useGetVendorReviews();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <MessageModal
        title="Error"
        description={error instanceof Error ? error.message : "Failed to fetch reviews"}
      />
    );
  }

  const reviewsData = data?.data || {};
  const summary = reviewsData.summary || { averageRating: 0, totalReviews: 0 };
  const comments = reviewsData.reviews || [];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <ReviewStatistics comments={comments} />
        <OverallRating
          averageRating={summary.averageRating}
          totalReviews={summary.totalReviews}
          comments={comments}
          breakdown={summary.breakdown}
        />
      </div>
      <CustomerReviewsSection comments={comments} />
    </div>
  );
};

const page = () => {
  return (
    <ErrorBoundary
      fallback={
        <MessageModal title="Error" description="Something went wrong" />
      }
    >
      <Suspense fallback={<PageSkeleton />}>
        <ReviewsPageContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default page;

