import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFavouriteSummary,
  getMyTrip,
  getMyTripME,
  getReviews,
  getUserReviewBookings,
  createReview,
  updateReview,
  CreateReviewData,
} from "./profile.service";
import { getMyTickets, getTicketDetail, Ticket, TicketsResponse } from "./support.service";

export const useGetReviewsQuery = (id: string) => {
  return useQuery({
    queryKey: ["getReviews"],
    queryFn: () => getReviews(id),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};

export const useGetUserReviewBookingsQuery = () => {
  return useQuery({
    queryKey: ["userReviewBookings"],
    queryFn: () => getUserReviewBookings(),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewData) => createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviewBookings"] });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: Partial<CreateReviewData> }) =>
      updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userReviewBookings"] });
    },
  });
};
export const useGetFavouriteSummary = () => {
  return useQuery({
    queryKey: ["favourite_summary"],
    queryFn: () => getFavouriteSummary(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const useGetMyTrips = () => {
  return useQuery({
    queryKey: ["my-trips"],
    queryFn: () => getMyTrip(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};

export const useGetMyTripME = () => {
  return useQuery({
    queryKey: ["my-trip-me"],
    queryFn: () => getMyTripME(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};

export const useGetMyTicketsQuery = (status?: string) => {
  return useQuery<TicketsResponse | null>({
    queryKey: ["support_tickets", status],
    queryFn: () => getMyTickets({ status }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useGetTicketDetailQuery = (ticketId: string | null) => {
  return useQuery<Ticket | null>({
    queryKey: ["support_ticket_detail", ticketId],
    queryFn: () => getTicketDetail(ticketId!),
    enabled: !!ticketId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

