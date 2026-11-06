"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsers, getDestination, singleUser, updateUserStatus, getUserProfile } from "./users.service";
import { usePanelRef } from "react-resizable-panels";

export const useAllUsers = (params?: any) => {
  return useQuery({
    queryKey: ["admin_users", params],
    queryFn: () => adminUsers(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useUser = (id: string) => {
    

  return useQuery({
    queryKey: ["single_user", id],
    queryFn: () => singleUser(id),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
    enabled: !!id,
  });
};

export const useUserProfile = (id: string) => {
  return useQuery({
    queryKey: ["user_profile", id],
    queryFn: () => getUserProfile(id),
    staleTime: 20000,
    enabled: !!id,
  });
};

export const useDestination =({
  id , booking
}:{
  id:string , booking:string
}) => {
    

  return useQuery({
    queryKey: ["destination", id, booking],
    queryFn: () => getDestination({
      id , booking
    }),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
    enabled: !!id && !!booking,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
};