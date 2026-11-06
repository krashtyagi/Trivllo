"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosApi } from "@/lib/axios";
import {
  Building2,
  Check,
  CheckCircle2,
  X,
  Loader2,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ─── API Services ────────────────────────────────────────

const getPendingProperties = async (params: any = {}) => {
  const res = await axiosApi.get("/admin/vendor-properties/pending", {
    params,
  });
  return res.data;
};

const approveProperty = async ({
  id,
  serviceType,
}: {
  id: string;
  serviceType: string;
}) => {
  const res = await axiosApi.post(`/admin/vendor-properties/${id}/approve`, {
    serviceType,
  });
  return res.data;
};

const rejectProperty = async ({
  id,
  serviceType,
  reason,
}: {
  id: string;
  serviceType: string;
  reason: string;
}) => {
  const res = await axiosApi.post(`/admin/vendor-properties/${id}/reject`, {
    serviceType,
    reason,
  });
  return res.data;
};

// ─── Hooks ───────────────────────────────────────────────

const usePendingProperties = (params: any = {}) => {
  return useQuery({
    queryKey: ["admin-pending-properties", params],
    queryFn: () => getPendingProperties(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

const useApproveProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-properties"],
      });
    },
  });
};

const useRejectProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-properties"],
      });
    },
  });
};

// ─── Main Page ───────────────────────────────────────────

export default function NewPropertiesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError } = usePendingProperties({
    page,
    limit: 10,
    serviceType: serviceTypeFilter || undefined,
  });

  const approveMutation = useApproveProperty();
  const rejectMutation = useRejectProperty();

  const properties = data?.data?.properties || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const handleCardClick = (property: any) => {
    const vendorId = property.vendor?._id || property.vendorId;
    if (vendorId) {
      router.push(`/properties/${vendorId}?propertyId=${property._id}`);
    }
  };

  const handleApprove = async (id: string, serviceType: string) => {
    try {
      await approveMutation.mutateAsync({ id, serviceType });
      toast.success("Property approved successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string, serviceType: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        id,
        serviceType,
        reason: rejectReason,
      });
      toast.success("Property rejected");
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            New Property Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve additional properties submitted by approved
            vendors
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={serviceTypeFilter}
            onChange={(e) => {
              setServiceTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Types</option>
            <option value="hotel">Hotels</option>
            <option value="tour">Tours</option>
          </select>
          <span className="text-sm text-muted-foreground">{total} pending</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">Failed to load pending properties</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center">
            <Check className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">No pending property requests</p>
          <p className="text-xs">
            All additional property submissions have been reviewed
          </p>
        </div>
      )}

      {/* Property Cards */}
      {!isLoading && properties.length > 0 && (
        <div className="grid gap-4">
          {properties.map((property: any) => (
            <div
              key={property._id}
              onClick={() => handleCardClick(property)}
              className="border rounded-2xl p-5 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group space-y-3 relative"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image */}
                <div className="w-full md:w-52 h-36 rounded-xl overflow-hidden bg-muted shrink-0 relative">
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <Building2 className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" /> Pending Review
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base md:text-lg group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {property.name}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {property.city || "N/A"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted capitalize">
                          {property.serviceType}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-primary font-semibold hidden sm:flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Details & Approve <ChevronRight size={14} />
                    </span>
                  </div>

                  {property.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                  )}

                  {/* Vendor Info - Approved Credentials */}
                  <div className="pt-2 border-t border-dashed">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Approved Vendor
                      </span>
                      <span>
                        <strong className="text-foreground font-medium">
                          Owner:
                        </strong>{" "}
                        {property.vendor?.ownerName || "N/A"}
                      </span>
                      <span>
                        <strong className="text-foreground font-medium">
                          Business:
                        </strong>{" "}
                        {property.vendor?.businessName || "N/A"}
                      </span>
                      {property.vendor?.propertyId && (
                        <span>
                          <strong className="text-foreground font-medium">
                            ID:
                          </strong>{" "}
                          #{property.vendor.propertyId.slice(-6).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {rejectingId === property._id ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 w-full"
                        >
                          <input
                            type="text"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="h-8 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-64"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(property._id, property.serviceType);
                            }}
                            disabled={rejectMutation.isPending}
                            className="h-8 px-3 rounded-md bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Confirm"
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="h-8 px-3 rounded-md border text-xs hover:bg-accent transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(property._id, property.serviceType);
                            }}
                            disabled={approveMutation.isPending}
                            className="h-8 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Quick Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectingId(property._id);
                            }}
                            className="h-8 px-3 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                      Open Full Hotel Details <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
