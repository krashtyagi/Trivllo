import { axiosApi } from "@/lib/axios";

// Multi-service vendor bookings
export const getMultiServiceBookings = async (params?: Record<string, any>) => {
  const res = await axiosApi.get("/multi-service-vendor/bookings", { params });
  return res;
};

export const getMultiServiceBookingById = async (id: string) => {
  const res = await axiosApi.get(`/multi-service-vendor/bookings/${id}`);
  return res;
};

// Multi-service vendor invoices
export const getMultiServiceInvoices = async (params?: Record<string, any>) => {
  const res = await axiosApi.get("/multi-service-vendor/invoices", { params });
  return res;
};

export const downloadMultiServiceInvoice = async (bookingId: string) => {
  try {
    const response = await axiosApi.get(
      `/multi-service-vendor/invoices/${bookingId}/download`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${bookingId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return { success: false, error };
  }
};

// Multi-service vendor dashboard
export const getMultiServiceStats = async (params?: Record<string, any>) => {
  const res = await axiosApi.get("/multi-service-vendor/dashboard/stats", { params });
  return res;
};

export const getMultiServiceAnalytics = async (params?: Record<string, any>) => {
  const res = await axiosApi.get("/multi-service-vendor/dashboard/analytics", { params });
  return res;
};

export const getMultiServiceRecentBookings = async (params?: Record<string, any>) => {
  const res = await axiosApi.get("/multi-service-vendor/dashboard/recent-bookings", { params });
  return res;
};

