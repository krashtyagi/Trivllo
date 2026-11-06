'use client'
import React, { useState } from 'react'
import { useReviewStats, useAllReviews } from './queryes'
import { ReviewStatsGrid } from './_components/review-stats'
import { ReviewDataTable } from './_components/review-table'
import { ReviewDetailView } from './_components/review-detail'
import { StatsGridSkeleton, TableSkeleton } from '@/components/loaders/dashboard-skeleton'

const ReviewsPage = () => {
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const { data: statsRes, isLoading: statsLoading } = useReviewStats();

  const filterParams: any = {};
  if (ratingFilter !== "all") {
    filterParams.rating = ratingFilter;
  }
  if (replyFilter !== "all") {
    filterParams.hasReply = replyFilter;
  }

  const { data: reviewsRes, isLoading: reviewsLoading } = useAllReviews(filterParams);

  if (selectedReviewId) {
    return (
      <ReviewDetailView
        reviewId={selectedReviewId}
        onBack={() => setSelectedReviewId(null)}
      />
    );
  }

  if (statsLoading || reviewsLoading) {
    return (
      <div className="space-y-6">
        <StatsGridSkeleton count={4} />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  const reviews = reviewsRes?.data?.data?.reviews || [];
  const stats = statsRes?.data?.data;

  return (
    <div className="space-y-6">
      <ReviewStatsGrid stats={stats} />
      <ReviewDataTable
        reviews={reviews}
        onSelectReview={(id) => setSelectedReviewId(id)}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        replyFilter={replyFilter}
        onReplyFilterChange={setReplyFilter}
      />
    </div>
  );
};

export default ReviewsPage;