'use client';

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActiveTax,
  verifyTaxPassword,
  setTaxWithPassword,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminSessions,
  revokeSession,
  revokeOtherSessions,
} from "./tax.service";

export const useActiveTax = () => {
  return useQuery({
    queryKey: ["active_tax"],
    queryFn: () => getActiveTax(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useVerifyTaxPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => verifyTaxPassword(password),
    onSuccess: (response) => {
      queryClient.setQueryData(["active_tax_unlocked"], response.data);
    },
  });
};

export const useSetTaxWithPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taxPercentage,
      password,
    }: {
      taxPercentage: number;
      password: string;
    }) => setTaxWithPassword({ taxPercentage, password }),
    onSuccess: (response) => {
      queryClient.setQueryData(["active_tax_unlocked"], response.data);
      queryClient.invalidateQueries({ queryKey: ["active_tax"] });
    },
  });
};

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ["admin_profile"],
    queryFn: () => getAdminProfile(),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateAdminProfile>[0]) =>
      updateAdminProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profile"] });
    },
  });
};

export const useChangeAdminPassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      changeAdminPassword(data),
  });
};

export const useAdminSessions = () => {
  return useQuery({
    queryKey: ["admin_sessions"],
    queryFn: () => getAdminSessions(),
    staleTime: 15000,
    refetchOnWindowFocus: true,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_sessions"] });
    },
  });
};

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => revokeOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_sessions"] });
    },
  });
};
