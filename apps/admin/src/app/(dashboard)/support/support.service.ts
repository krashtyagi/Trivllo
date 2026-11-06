import { axiosApi } from "@/lib/axios"

export const getSupportStats = () => {
    return axiosApi.get(`admin/supports/stats`);
}

export const getAllTickets = (params?: any) => {
    return axiosApi.get(`admin/supports`, { params });
}

export const getTicketDetail = (ticketId: string) => {
    return axiosApi.get(`admin/supports/${ticketId}`);
}

export const replyToTicket = (ticketId: string, message: string) => {
    return axiosApi.post(`admin/supports/${ticketId}/reply`, { message });
}

export const closeTicket = (ticketId: string) => {
    return axiosApi.patch(`admin/supports/${ticketId}/close`);
}