import { axiosApi } from "@/lib/axios";
import { vendorAccessToken } from "./auth";

export const currentUser = async () => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(vendorAccessToken)
        : null;

    if (!token) {
      return null;
    }

    const res = await axiosApi.get("/vendors/me");
    const data = res.data?.data;

    // Check vendor entity presence or role
    const isVendor = Boolean(
      data && (data.vendor || data.role === "vendor" || data.isVendor)
    );

    if (!isVendor) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(vendorAccessToken);
        localStorage.removeItem("status");
        localStorage.removeItem("category");
      }
      return null;
    }

    // Attach role and isVendor to data for easy guard checks across the app
    if (data) {
      data.role = "vendor";
      data.isVendor = true;
      if (data.vendor?.status && !data.status) {
        data.status = data.vendor.status;
      }
      if (data.vendor?.serviceType && !data.serviceType) {
        data.serviceType = data.vendor.serviceType;
      }
    }

    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(vendorAccessToken);
        localStorage.removeItem("status");
        localStorage.removeItem("category");
      }
    }
    return null;
  }
};
