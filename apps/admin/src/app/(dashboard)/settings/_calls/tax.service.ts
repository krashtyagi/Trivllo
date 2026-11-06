import { axiosApi } from "@/lib/axios";

export const getActiveTax = () => {
  return axiosApi.get(`admin/tax/active`);
};

export const verifyTaxPassword = (password: string) => {
  return axiosApi.post(`admin/tax/verify-password`, { password });
};

export const setTaxWithPassword = ({
  taxPercentage,
  password,
}: {
  taxPercentage: number;
  password: string;
}) => {
  return axiosApi.post(`admin/tax/set-tax`, { taxPercentage, password });
};

export const getAdminProfile = () => {
  return axiosApi.get(`/users/me`);
};

export const updateAdminProfile = (data: {
  name?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  country?: string;
  address?: string;
  gender?: string;
}) => {
  return axiosApi.patch(`/users/update-me`, data);
};

export const changeAdminPassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return axiosApi.patch(`/auth/change-password`, data);
};

export const getAdminSessions = () => {
  return axiosApi.get(`/admin/sessions/my-sessions`);
};

export const revokeSession = (sessionId: string) => {
  return axiosApi.delete(`/admin/sessions/${sessionId}`);
};

export const revokeOtherSessions = () => {
  return axiosApi.delete(`/admin/sessions/revoke-other-sessions`);
};
