"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "./session.service";

export const SESSIONS_QUERY_KEY = ["admin_sessions"];
export const USER_SESSIONS_QUERY_KEY = ["admin_user_sessions"];

export const useAllSessions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  deviceType?: string;
}) => {
  return useQuery({
    queryKey: [...SESSIONS_QUERY_KEY, params],
    queryFn: () => sessionService.getAllSessions(params),
    staleTime: 10000,
    refetchInterval: 30000, // Periodically refresh active sessions
    refetchOnWindowFocus: true,
  });
};

export const useUserSessions = (userId: string) => {
  return useQuery({
    queryKey: [...USER_SESSIONS_QUERY_KEY, userId],
    queryFn: () => sessionService.getUserSessions(userId),
    enabled: Boolean(userId),
    staleTime: 10000,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_SESSIONS_QUERY_KEY });
    },
  });
};

export const useRevokeAllUserSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => sessionService.revokeAllUserSessions(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_SESSIONS_QUERY_KEY });
    },
  });
};
