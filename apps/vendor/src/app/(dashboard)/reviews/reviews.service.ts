import { axiosApi } from "@/lib/axios";

export const getVendorReviews = async () => {
  const res = await axiosApi.get("/reviews/vendor");
  return res.data;
};

export const vendorReply = async (reviewId: string, message: string) => {
  const res = await axiosApi.post(`/reviews/vendor/reply/${reviewId}`, { message });
  return res.data;
};
