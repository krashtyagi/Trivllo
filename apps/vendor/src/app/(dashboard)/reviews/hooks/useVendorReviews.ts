import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendorReviews, vendorReply } from "../reviews.service";

export const useGetVendorReviews = () => {
  return useQuery({
    queryKey: ["vendorReviews"],
    queryFn: getVendorReviews,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useVendorReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, message }: { reviewId: string; message: string }) =>
      vendorReply(reviewId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorReviews"] });
    },
  });
};
