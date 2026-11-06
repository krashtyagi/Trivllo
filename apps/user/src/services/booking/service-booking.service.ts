import { axiosApi } from "@/lib/axios";

/**
 * Create a multi-service booking (tours, bikes, adventures, cabs)
 * Backend: POST /api/v1/service-bookings/booking
 */
export const createServiceBooking = async (data: any) => {
  try {
    const response = await axiosApi.post("/service-bookings/booking", data);
    return response.data;
  } catch (error) {
    console.error(error, "from createServiceBooking error");
    throw error;
  }
};

/**
 * Verify Razorpay payment for multi-service bookings
 * Backend: POST /api/v1/service-bookings/verify-payment
 */
export const verifyServicePayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await axiosApi.post(
    "/service-bookings/verify-payment",
    data
  );
  return response.data;
};
