import { userAccessToken } from "@/types/auth";
import axios from "axios";

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const raw = envUrl.trim().replace(/\/+$/, "");
    return raw.endsWith("/api/v1") ? raw : `${raw}/api/v1`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  return "http://localhost:3000/api/v1";
};

export const axiosApi = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

axiosApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(userAccessToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
