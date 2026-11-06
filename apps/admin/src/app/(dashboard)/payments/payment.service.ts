import { axiosApi } from "@/lib/axios"

export const getPaymentStats = () => {
    return axiosApi.get(`admin/payments/stats`);
}

export const getPaymentAnalytics = (params?: any) => {
    return axiosApi.get(`admin/payments/analytics`, { params });
}

export const getAllPayments = (params?: any) => {
    return axiosApi.get(`admin/payments`, { params });
}

export const getPaymentDetail = (paymentId: string) => {
    return axiosApi.get(`admin/payments/${paymentId}`);
}

export const getRefundRequests = (params?: any) => {
    return axiosApi.get(`admin/payments/refunds`, { params });
}

export const handleRefund = (paymentId: string, action: "approve" | "reject") => {
    return axiosApi.patch(`admin/payments/${paymentId}/refund`, { action });
}
