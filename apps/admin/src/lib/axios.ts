import { adminAccessToken } from "@/services/auth";
import axios from "axios";

const rawBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").trim().replace(/\/+$/, "");
const baseURL = rawBase.endsWith("/api/v1") ? rawBase : `${rawBase}/api/v1`;

export const axiosApi = axios.create({
  baseURL,
  withCredentials: true,
});

axiosApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(adminAccessToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
