import { axiosApi } from "@/lib/axios"

export const getReviewStats = () => {
  return axiosApi.get(`admin/reviews/stats`);
}

export const getAllReviews = (params?: any) => {
  return axiosApi.get(`admin/reviews`, { params });
}

export const getReviewDetail = (reviewId: string) => {
  return axiosApi.get(`admin/reviews/${reviewId}`);
}

export const deleteReview = (reviewId: string) => {
  return axiosApi.delete(`admin/reviews/${reviewId}`);
}

export const flagReview = (reviewId: string, data: { isFlagged: boolean; reason?: string }) => {
  return axiosApi.patch(`admin/reviews/${reviewId}/flag`, data);
}
