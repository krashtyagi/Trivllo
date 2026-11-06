"use client";
import { useQuery } from "@tanstack/react-query";
import { getBookingById, getBookings, getBookingsStats } from "./bookings.service";

export const useBookings = (params?: any) => {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => getBookings(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};
export const useBookingStats = () => {

  return useQuery({
    queryKey: ["getBookingsStats"],
    queryFn: () => getBookingsStats(),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
  });
};
export const useBookingById = (id:string) => {

  return useQuery({
    queryKey: ["getBookingById", id],
    queryFn: () => getBookingById(id),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false, // optional
    enabled:!!id
  });
};