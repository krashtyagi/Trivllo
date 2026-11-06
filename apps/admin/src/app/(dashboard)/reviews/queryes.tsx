'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReviewStats,
  getAllReviews,
  getReviewDetail,
  deleteReview,
  flagReview,
} from "./review.service";

export const useReviewStats = () => {
  return useQuery({
    queryKey: ["review_stats"],
    queryFn: () => getReviewStats(),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useAllReviews = (params?: any) => {
  return useQuery({
    queryKey: ["admin_reviews", params],
    queryFn: () => getAllReviews(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useReviewDetail = (reviewId: string) => {
  return useQuery({
    queryKey: ["review_detail", reviewId],
    queryFn: () => getReviewDetail(reviewId),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!reviewId,
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review_stats"] });
    },
  });
};

export const useFlagReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, isFlagged, reason }: { reviewId: string; isFlagged: boolean; reason?: string }) =>
      flagReview(reviewId, { isFlagged, reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["review_detail", variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review_stats"] });
    },
  });
};
