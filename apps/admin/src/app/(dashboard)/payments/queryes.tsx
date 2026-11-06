'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPaymentStats,
  getPaymentAnalytics,
  getAllPayments,
  getPaymentDetail,
  getRefundRequests,
  handleRefund,
} from "./payment.service";

export const usePaymentStats = () => {
  return useQuery({
    queryKey: ["payment_stats"],
    queryFn: () => getPaymentStats(),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const usePaymentAnalytics = (range?: string) => {
  return useQuery({
    queryKey: ["payment_analytics", range],
    queryFn: () => getPaymentAnalytics(range ? { range } : undefined),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useAllPayments = (params?: any) => {
  return useQuery({
    queryKey: ["admin_payments", params],
    queryFn: () => getAllPayments(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const usePaymentDetail = (paymentId: string) => {
  return useQuery({
    queryKey: ["payment_detail", paymentId],
    queryFn: () => getPaymentDetail(paymentId),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!paymentId,
  });
};

export const useRefundRequests = (params?: any) => {
  return useQuery({
    queryKey: ["refund_requests", params],
    queryFn: () => getRefundRequests(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useHandleRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, action }: { paymentId: string; action: "approve" | "reject" }) =>
      handleRefund(paymentId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refund_requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin_payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment_stats"] });
    },
  });
};
