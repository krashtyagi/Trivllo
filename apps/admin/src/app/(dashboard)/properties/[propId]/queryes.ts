"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  propertiesDetails,
  approveProperty,
  rejectProperty,
  markIssue,
  verifySection,
  updateBusinessRank,
  assignPromotion,
  getPropertyListings,
  approveAdditionalProperty,
  rejectAdditionalProperty,
  blockProperty,
  unblockProperty,
  deleteProperty,
  getDeletedProperties,
  cleanAllDeletedProperties,
  deleteDeletedPropertyRecord,
  updatePropertyImages,
} from "./dash.service";

export const usePropertyDetails = (id: string, propertyId?: string) => {
  return useQuery({
    queryKey: ["admin_property_details", id, propertyId],
    queryFn: () => propertiesDetails(id, propertyId),
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false,
  });
};

export const useApproveProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveProperty(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", id] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useRejectProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectedSteps, reasons }: { id: string; rejectedSteps: number[]; reasons: Record<number, string> }) =>
      rejectProperty(id, { rejectedSteps, reasons }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", id] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useMarkIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, step, reason }: { vendorId: string; step: number; reason: string }) =>
      markIssue(vendorId, step, reason),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useVerifySection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, step }: { vendorId: string; step: number }) =>
      verifySection(vendorId, step),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useUpdateBusinessRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ businessId, serviceType, rank }: { businessId: string; serviceType: string; rank: string }) =>
      updateBusinessRank(businessId, serviceType, rank),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useAssignPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      vendorId: string;
      serviceType: string;
      serviceId: string;
      rank: string;
      startDate?: string | Date;
      endDate?: string | Date;
    }) => assignPromotion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
    },
  });
};

export const usePropertyListings = (vendorId: string, propertyId?: string) => {
  return useQuery({
    queryKey: ["admin_property_listings", vendorId, propertyId],
    queryFn: () => getPropertyListings(vendorId, propertyId),
    enabled: !!vendorId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useApproveAdditionalProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, serviceType }: { id: string; serviceType: string }) =>
      approveAdditionalProperty(id, serviceType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useRejectAdditionalProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      serviceType,
      reason,
    }: {
      id: string;
      serviceType: string;
      reason: string;
    }) => rejectAdditionalProperty(id, serviceType, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useBlockProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      blockProperty(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", id] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useUnblockProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unblockProperty(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin_property_details", id] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: string | { id: string; reason?: string }) => {
      const propertyId = typeof data === "string" ? data : data.id;
      const deleteReason = typeof data === "string" ? undefined : data.reason;
      return deleteProperty(propertyId, deleteReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property"] });
      queryClient.invalidateQueries({ queryKey: ["deleted_properties"] });
    },
  });
};

export const useDeletedProperties = (params?: any) => {
  return useQuery({
    queryKey: ["deleted_properties", params],
    queryFn: () => getDeletedProperties(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCleanAllDeletedProperties = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cleanAllDeletedProperties(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted_properties"] });
    },
  });
};

export const useDeleteDeletedPropertyRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeletedPropertyRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deleted_properties"] });
    },
  });
};

export const useUpdatePropertyImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      images,
      serviceType,
      propertyId,
    }: {
      id: string;
      images: any[];
      serviceType?: string;
      propertyId?: string;
    }) => updatePropertyImages(id, { images, serviceType, propertyId }),
    onSuccess: (_, { id, propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin_property_details", id, propertyId || ""],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin_property_details", id],
      });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
};


