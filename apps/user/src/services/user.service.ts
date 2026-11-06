import { axiosApi } from "@/lib/axios";
import { getSession } from "@/lib/auth-client";
import { userAccessToken } from "@/types/auth";

export const currentUser = async () => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(userAccessToken)
        : null;

    // Customer portal strictly requires customer login (userAccessToken in localStorage)
    if (!token) {
      return null;
    }

    const res = await axiosApi.get("/users/me");
    const userRole = res.data?.data?.role || res.data?.role;

    // Vendor accounts are isolated and must use the vendor portal
    if (userRole && userRole === "vendor") {
      if (typeof window !== "undefined") {
        localStorage.removeItem(userAccessToken);
        localStorage.removeItem("refreshToken");
      }
      return null;
    }

    return res.data;
  } catch (error) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(userAccessToken);
      localStorage.removeItem("refreshToken");
    }
    return null;
  }
};
