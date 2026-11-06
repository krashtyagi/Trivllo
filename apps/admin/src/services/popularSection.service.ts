import { axiosApi } from "@/lib/axios";

export interface PopularSectionItem {
  _id: string;
  tagline: string;
  city: string;
  category: "hotel" | "tour" | "cab" | "bike" | "adventure";
  aliases: string[];
  order: number;
  isActive: boolean;
  limit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePopularSectionPayload {
  tagline: string;
  city: string;
  category?: "hotel" | "tour" | "cab" | "bike" | "adventure";
  aliases?: string[] | string;
  order?: number;
  isActive?: boolean;
  limit?: number;
}

export const getAllPopularSections = async (category = "hotel"): Promise<PopularSectionItem[]> => {
  const res = await axiosApi.get(`admin/popular-sections?category=${category}`);
  return res.data?.data || [];
};

export const createPopularSection = async (
  payload: CreatePopularSectionPayload
): Promise<PopularSectionItem> => {
  const res = await axiosApi.post("admin/popular-sections", payload);
  return res.data?.data;
};

export const updatePopularSection = async (
  id: string,
  payload: Partial<CreatePopularSectionPayload>
): Promise<PopularSectionItem> => {
  const res = await axiosApi.put(`admin/popular-sections/${id}`, payload);
  return res.data?.data;
};

export const togglePopularSectionActive = async (id: string): Promise<PopularSectionItem> => {
  const res = await axiosApi.patch(`admin/popular-sections/${id}/toggle-active`);
  return res.data?.data;
};

export const deletePopularSection = async (id: string): Promise<void> => {
  await axiosApi.delete(`admin/popular-sections/${id}`);
};

export const reorderPopularSections = async (
  items: { id: string; order: number }[]
): Promise<void> => {
  await axiosApi.post("admin/popular-sections/reorder", { items });
};

export const resetDefaultPopularSections = async (
  category = "hotel"
): Promise<PopularSectionItem[]> => {
  const res = await axiosApi.post("admin/popular-sections/reset-defaults", { category });
  return res.data?.data || [];
};
