"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPopularSections,
  createPopularSection,
  updatePopularSection,
  togglePopularSectionActive,
  deletePopularSection,
  reorderPopularSections,
  resetDefaultPopularSections,
  CreatePopularSectionPayload,
  PopularSectionItem,
} from "@/services/popularSection.service";

export const usePopularSections = (category = "hotel") => {
  return useQuery<PopularSectionItem[]>({
    queryKey: ["popular_sections", category],
    queryFn: () => getAllPopularSections(category),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCreatePopularSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePopularSectionPayload) => createPopularSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular_sections"] });
    },
  });
};

export const useUpdatePopularSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePopularSectionPayload> }) =>
      updatePopularSection(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular_sections"] });
    },
  });
};

export const useTogglePopularSectionActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => togglePopularSectionActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular_sections"] });
    },
  });
};

export const useDeletePopularSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePopularSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular_sections"] });
    },
  });
};

export const useReorderPopularSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => reorderPopularSections(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular_sections"] });
    },
  });
};

export const useResetPopularSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category?: string) => resetDefaultPopularSections(category || "hotel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular_sections"] });
    },
  });
};
