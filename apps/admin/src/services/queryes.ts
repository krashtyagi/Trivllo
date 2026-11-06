"use client";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "./user.service";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: currentUser,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};
