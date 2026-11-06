"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getMultiServiceBookings,
  getMultiServiceBookingById,
  getMultiServiceInvoices,
  getMultiServiceStats,
  getMultiServiceAnalytics,
  getMultiServiceRecentBookings,
} from "./multiservice.service";

export const useMultiServiceBookings = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["multi-service-bookings", params],
    queryFn: () => getMultiServiceBookings(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useMultiServiceBookingById = (id: string) => {
  return useQuery({
    queryKey: ["multi-service-booking", id],
    queryFn: () => getMultiServiceBookingById(id),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!id,
  });
};

export const useMultiServiceInvoices = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["multi-service-invoices", params],
    queryFn: () => getMultiServiceInvoices(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useMultiServiceStats = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["multi-service-dashboard-stats", params],
    queryFn: () => getMultiServiceStats(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useMultiServiceAnalytics = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["multi-service-dashboard-analytics", params],
    queryFn: () => getMultiServiceAnalytics(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useMultiServiceRecentBookings = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["multi-service-dashboard-recent-bookings", params],
    queryFn: () => getMultiServiceRecentBookings(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

