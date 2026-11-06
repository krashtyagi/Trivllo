'use client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupportStats, getAllTickets, getTicketDetail, replyToTicket, closeTicket } from "./support.service";

export const useSupportStsts = () => {
  return useQuery({
    queryKey: ["getSupportStats"],
    queryFn: () => getSupportStats(),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useAllTickets = (params?: any) => {
  return useQuery({
    queryKey: ["admin_tickets", params],
    queryFn: () => getAllTickets(params),
    staleTime: 20000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useTicketDetail = (ticketId: string) => {
  return useQuery({
    queryKey: ["ticket_detail", ticketId],
    queryFn: () => getTicketDetail(ticketId),
    staleTime: 10000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: false,
    enabled: !!ticketId,
  });
};

export const useReplyToTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      replyToTicket(ticketId, message),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ticket_detail", variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ["admin_tickets"] });
    },
  });
};

export const useCloseTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => closeTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_tickets"] });
      queryClient.invalidateQueries({ queryKey: ["getSupportStats"] });
    },
  });
};