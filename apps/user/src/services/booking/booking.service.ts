// import { BookingData } from "@/app/(personal)/book/[[...slug]]/_components/paymentform";
import { axiosApi } from "@/lib/axios";

export const cancelBooking = (id: string) => {
  try {
    const response = axiosApi.patch(`/bookings/${id}/cancel`);
    return response;
  } catch (error) {
    console.error(error, "from cancelBooking  error");
  }
};
export const createBooking = async (data: any) => {
  try {
    const response = await axiosApi.post("/bookings", data);

    return response.data;
  } catch (error: any) {
    console.error(error, "from createBooking  error");
    throw error;
  }
};

export const verifyPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await axiosApi.post("/payments/verify", data);
  return response.data;
};

export const getMyBookings = async () => {
  try {
    const response = await axiosApi.get("/bookings/my-bookings");
    return response.data;
  } catch (error) {
    console.error(error, "from getMyBookings  error");
  }
};

export const getBookingById = async (id: string) => {
  try {
    const response = await axiosApi.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(error, "from getBookingById  error");
  }
};
