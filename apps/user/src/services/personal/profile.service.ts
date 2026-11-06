import { axiosApi } from "@/lib/axios";
import { toast } from "sonner";
export const DeleteRequest = async ({ reason }: { reason: string }) => {
  try {
    const res = await axiosApi.post(`/users/delete-account-request`, {
      params: {
        reason: reason,
      },
    });
    return res.data;
  } catch (error: any) {
    toast.error(error?.message);
  }
};
export const getReviews = async (id: string) => {
  try {
    const response = await axiosApi.get(`/reviews/hotel/${id}`);
    return response.data;
  } catch (error) {
    toast.error("Failed to get reviews");
    throw error;
  }
};

export const getUserReviewBookings = async () => {
  try {
    const response = await axiosApi.get("/reviews");
    return response.data;
  } catch (error) {
    toast.error("Failed to get your review bookings");
    throw error;
  }
};

export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment: string;
  breakdown?: {
    facilities: number;
    cleanliness: number;
    services: number;
    comfort: number;
    location: number;
  };
}

export const createReview = async (data: CreateReviewData) => {
  try {
    const response = await axiosApi.post("/reviews", data);
    return response.data;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to submit review");
    throw error;
  }
};

export const updateReview = async (reviewId: string, data: Partial<CreateReviewData>) => {
  try {
    const response = await axiosApi.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update review");
    throw error;
  }
};
export const getFavouriteSummary = async () => {
  try {
    const res = await axiosApi.get(`/favorites/summary`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getMyTrip = async () => {
  try {
    const res = await axiosApi.get(`/favorites/my-trip`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
export const getMyTripME = async () => {
  try {
    const res = await axiosApi.get(`/favorites/me`);
    return res.data;
  } catch (error) {
    console.error(error);
    toast.error("something went wrong");
  }
};
