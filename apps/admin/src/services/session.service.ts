import { axiosApi } from "@/lib/axios";

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: "desktop" | "mobile" | "tablet" | string;
  deviceModel: string;
  deviceVendor: string;
}

export interface SessionUser {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface SessionItem {
  _id: string;
  id: string;
  userId: string;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  device: DeviceInfo;
  user?: SessionUser;
}

export interface SessionStats {
  totalActiveSessions: number;
  totalFiltered: number;
  uniqueUsersCount: number;
  desktopCount: number;
  mobileCount: number;
  tabletCount: number;
}

export interface SessionsResponse {
  sessions: SessionItem[];
  stats: SessionStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalPages?: number;
  };
}

export const sessionService = {
  // Fetch all active sessions across all users
  async getAllSessions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    deviceType?: string;
  }): Promise<{ success: boolean; data: SessionsResponse }> {
    const res = await axiosApi.get("/admin/sessions", { params });
    return res.data;
  },

  // Fetch active sessions for a specific user
  async getUserSessions(userId: string): Promise<{
    success: boolean;
    data: {
      userId: string;
      total: number;
      sessions: SessionItem[];
    };
  }> {
    const res = await axiosApi.get(`/admin/sessions/user/${userId}`);
    return res.data;
  },

  // Revoke an individual device session
  async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const res = await axiosApi.delete(`/admin/sessions/${sessionId}`);
    return res.data;
  },

  // Revoke all device sessions for a user
  async revokeAllUserSessions(userId: string): Promise<{ success: boolean; message: string; count: number }> {
    const res = await axiosApi.delete(`/admin/sessions/user/${userId}`);
    return res.data;
  },
};
