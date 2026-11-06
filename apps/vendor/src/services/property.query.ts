"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVendorProperties,
  addVendorProperty,
  switchVendorProperty,
  getActiveProperty,
} from "./property.service";

export const useVendorProperties = () => {
  return useQuery({
    queryKey: ["vendor-properties"],
    queryFn: getVendorProperties,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useActiveProperty = () => {
  return useQuery({
    queryKey: ["vendor-active-property"],
    queryFn: getActiveProperty,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: false,
  });
};

export const useSwitchProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: switchVendorProperty,
    onSuccess: () => {
      // Invalidate everything that depends on the active property
      queryClient.invalidateQueries({ queryKey: ["current_user"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-properties"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-active-property"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-getRooms"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-getRoomById"] });
      queryClient.invalidateQueries({ queryKey: ["user-getDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["user-multivendor"] });
      queryClient.invalidateQueries({ queryKey: ["user-getToursServices"] });
      queryClient.invalidateQueries({ queryKey: ["user-getCabsServices"] });
      queryClient.invalidateQueries({ queryKey: ["user-getBikesServices"] });
      queryClient.invalidateQueries({ queryKey: ["user-getAdventuresServices"] });
    },
  });
};

export const useAddProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addVendorProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-properties"] });
      queryClient.invalidateQueries({ queryKey: ["current_user"] });
    },
  });
};
