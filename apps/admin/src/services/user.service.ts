import { axiosApi } from "@/lib/axios";
import { getSession } from "@/lib/auth-client";
import { adminAccessToken } from "./auth";

export const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "blog_author",
  "blog_editor",
  "seo_manager",
  "reviewer",
];

export const currentUser = async () => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(adminAccessToken)
        : null;

    // Admin portal MUST require intentional admin login (adminAccessToken in localStorage)
    if (!token) {
      return null;
    }

    const session = await getSession();
    if (!session?.data?.user && !token) {
      return null;
    }

    const res = await axiosApi.get("/users/me");
    const userRole = res.data?.data?.role || res.data?.role;

    // Reject non-admin users (e.g. regular customers logged in on frontend)
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(adminAccessToken);
      }
      return null;
    }

    return res.data;
  } catch (error) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(adminAccessToken);
    }
    return null;
  }
};
