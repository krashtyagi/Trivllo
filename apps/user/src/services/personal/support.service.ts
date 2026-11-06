import { axiosApi } from "@/lib/axios";
import { toast } from "sonner";

export interface TicketMessage {
  sender: "user" | "admin";
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  bookingReference?: string;
  createdAt: string;
  lastMessageAt: string;
  messages?: TicketMessage[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: Pagination;
}

export interface CreateTicketParams {
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  description: string;
  bookingReference?: string;
}

export const getMyTickets = async (
  params: { page?: number; limit?: number; status?: string } = {},
): Promise<TicketsResponse | null> => {
  try {
    const res = await axiosApi.get("/supports", { params });
    if (res.data.success) {
      return res.data.data;
    }
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to fetch support tickets";
    toast.error(message);
    return null;
  }
};

export const createTicket = async (
  data: CreateTicketParams,
): Promise<Ticket | null> => {
  try {
    const res = await axiosApi.post("/supports", data);
    if (res.data.success) {
      toast.success("Support ticket created successfully");
      return res.data.data;
    }
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to create support ticket";
    toast.error(message);
    return null;
  }
};

export const getTicketDetail = async (
  ticketId: string,
): Promise<Ticket | null> => {
  try {
    const res = await axiosApi.get(`/supports/${ticketId}`);
    if (res.data.success) {
      return res.data.data;
    }
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to fetch ticket details";
    toast.error(message);
    return null;
  }
};

export const replyToTicket = async (
  ticketId: string,
  message: string,
): Promise<Ticket | null> => {
  try {
    const res = await axiosApi.post(`/supports/${ticketId}/reply`, { message });
    if (res.data.success) {
      toast.success("Reply sent successfully");
      return res.data.data;
    }
    return null;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to send reply";
    toast.error(message);
    return null;
  }
};
