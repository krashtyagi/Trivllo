"use client";
import React, { Suspense, useState } from "react";
import {
  Building2,
  MapPin,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  ImageIcon,
  Landmark,
  FileCheck,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  Loader2,
  Crown,
  Sparkles,
  Award,
  Calendar as CalendarIcon,
  ArrowRight,
  BedDouble,
  Package,
  Ban,
  Unlock,
  Trash2,
  Clock,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  usePropertyDetails,
  useApproveProperty,
  useRejectProperty,
  useApproveAdditionalProperty,
  useRejectAdditionalProperty,
  useMarkIssue,
  useVerifySection,
  useAssignPromotion,
  useBlockProperty,
  useUnblockProperty,
  useDeleteProperty,
  useUpdatePropertyImages,
} from "./queryes";
import { AdminPropertyImageArranger } from "./_components/admin-property-image-arranger";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { WarningDialog } from "@/components/overlay/warnings";
import { toast } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { PageSkeleton } from "@/components/loaders/loader/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { ImagePreview } from "@/components/ui/image-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RouterPush } from "@/components/RouterPush";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Step labels mapping
const STEP_LABELS: Record<number, string> = {
  2: "Verification Documents",
  3: "Bank Details",
  4: "Property Details",
};

export const formatAddress = (addr: any): string => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    if (addr.formattedAddress) return addr.formattedAddress;
    const parts = [
      addr.doorNumber,
      addr.buildingName,
      addr.streetAddress,
      addr.areaName,
      addr.landmark,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return "";
};

// ─── Pending Hotel Approval Card ──────────────────────────────────────────
function PendingHotelApprovalCard({
  propertyDetails,
  vendor,
  user,
  businessDetails,
  bankDetails,
}: {
  propertyDetails: any;
  vendor: any;
  user: any;
  businessDetails: any;
  bankDetails: any;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const approveMutation = useApproveAdditionalProperty();
  const rejectMutation = useRejectAdditionalProperty();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        id: propertyDetails._id,
        serviceType: vendor?.serviceType || "hotel",
      });
      toast.success("Hotel approved successfully! Now live on Trivllo.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve hotel");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        id: propertyDetails._id,
        serviceType: vendor?.serviceType || "hotel",
        reason: reason.trim(),
      });
      toast.success("Hotel rejected");
      setRejectOpen(false);
      setReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject hotel");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-foreground">
                Property Awaiting Admin Approval
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Action Required
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review hotel details and vendor credentials below, then approve or reject this submission.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setRejectOpen(true)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="h-9 px-4 rounded-xl border border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            Reject Hotel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {approveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Approve Hotel
          </button>
        </div>
      </div>

      {/* Mention Vendor Approved Details */}
      <div className="p-3.5 rounded-xl bg-background/80 border border-border/80 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Vendor Approved Credentials
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Account Status: {vendor?.status?.toUpperCase() || "APPROVED"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
            <p className="text-[10px] font-medium text-muted-foreground">Owner & Business</p>
            <p className="text-xs font-bold text-foreground truncate mt-0.5">
              {businessDetails?.businessName || "N/A"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.name} ({user?.email})
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
            <p className="text-[10px] font-medium text-muted-foreground">KYC Documents</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={12} /> Verified
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              PAN: {businessDetails?.panNumber || "On file"}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
            <p className="text-[10px] font-medium text-muted-foreground">Settlement Bank</p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={12} /> {bankDetails?.verificationStatus === "verified" ? "Verified" : "Attached"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {bankDetails?.bankName || "Bank on file"}
            </p>
          </div>
        </div>
      </div>

      {/* Reject Modal / Reason input */}
      {rejectOpen && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600">Provide reason for rejection:</span>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incomplete hotel images, incorrect address, missing documents..."
            className="text-xs min-h-[60px]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectOpen(false)}
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={rejectMutation.isPending || !reason.trim()}
              onClick={handleReject}
              className="text-xs h-7 gap-1"
            >
              {rejectMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const PropertyDetailContent = () => {
  const { propId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(propId) ? propId[0] : propId || "";
  const queryPropertyId = searchParams.get("propertyId") || "";

  const { data, isLoading } = usePropertyDetails(id, queryPropertyId);
  const updatePropertyImagesMutation = useUpdatePropertyImages();
  const vendorData = (data as any)?.data;

  if (isLoading || !vendorData) return <PageSkeleton />;

  const {
    vendor,
    user,
    businessDetails,
    documents,
    bankDetails,
    propertyDetails,
    promotion,
    businessId,
  } = vendorData;

  const properties = vendorData.properties || [];

  const handleSelectProperty = (targetPropertyId: string) => {
    router.replace(`/properties/${id}?propertyId=${targetPropertyId}`, {
      scroll: false,
    });
  };

  const rawAddress =
    formatAddress(propertyDetails?.address) ||
    formatAddress(businessDetails?.address);
  const city =
    propertyDetails?.city ||
    businessDetails?.city ||
    (typeof propertyDetails?.address === "object" ? propertyDetails?.address?.city : "") ||
    "";
  const displayAddress = rawAddress
    ? city && !rawAddress.toLowerCase().includes(city.toLowerCase())
      ? `${rawAddress}, ${city}`
      : rawAddress
    : city || "N/A";

  const isCurrentPropertyPending =
    propertyDetails &&
    (propertyDetails.verificationStatus === "pending" || !propertyDetails.isActive);

  const handleSavePropertyImages = async (updatedImages: any[]) => {
    try {
      const targetId = propertyDetails?._id || businessId || id;
      await updatePropertyImagesMutation.mutateAsync({
        id: targetId,
        images: updatedImages,
        serviceType: vendor?.serviceType || "hotel",
        propertyId: propertyDetails?._id,
      });
      toast.success("Property gallery images & index order saved successfully!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update property images",
      );
      throw err;
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <MessageModal title="Error" description="Something went wrong" />
      }
    >
      <Suspense fallback={<PageSkeleton />}>
        <div className="min-h-screen font-sans">
          <div className="w-full mx-auto space-y-3">
            {/* Header */}
            <header className="rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {propertyDetails?.name ||
                      businessDetails?.businessName ||
                      "Property"}
                  </h1>
                  <StatusBadge status={vendor?.status} />
                  {vendor?.serviceType && (
                    <Badge
                      variant="outline"
                      className="capitalize text-[10px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 font-medium"
                    >
                      {vendor.serviceType}
                    </Badge>
                  )}
                  {isCurrentPropertyPending && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold animate-pulse flex items-center gap-1"
                    >
                      <Clock size={11} />
                      Hotel Pending Approval
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <MapPin size={14} className="text-zinc-400" />
                  <span className="text-xs font-medium">
                    {displayAddress}
                  </span>
                </div>
              </div>
              <div className="bg-muted/50 border border-border rounded-xl px-4 py-2 text-center">
                <p className="text-[9px] font-bold uppercase text-muted-foreground leading-none">
                  ID
                </p>
                <p className="font-mono text-base font-bold text-foreground">
                  #{vendor?._id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </header>

            {/* Hotel / Property Tabs */}
            {properties && properties.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-3.5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {vendor?.serviceType === "hotel" ? "Hotels" : "Properties"} ({properties.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    Click a tab to view details & manage hotel
                  </span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {properties.map((prop: any) => {
                    const isSelected =
                      (propertyDetails?._id || propertyDetails?.id) === prop._id;
                    return (
                      <button
                        key={prop._id}
                        type="button"
                        onClick={() => handleSelectProperty(prop._id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all shrink-0 cursor-pointer group",
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/40 font-semibold"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {/* Hotel Profile Image */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border/80 shrink-0 relative">
                          {prop.image ? (
                            <img
                              src={prop.image}
                              alt={prop.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                              <Building2 size={18} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 pr-1">
                          <span className="text-xs font-semibold truncate max-w-[170px] text-foreground">
                            {prop.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {prop.city && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">
                                {prop.city}
                              </span>
                            )}
                            {prop.verificationStatus === "verified" && prop.isActive ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                <CheckCircle2 size={10} /> Approved
                              </span>
                            ) : prop.verificationStatus === "pending" || !prop.isActive ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                                <Clock size={10} /> Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20">
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-8 space-y-3">
                {/* Pending Hotel Approval Banner (when pending) */}
                {isCurrentPropertyPending && (
                  <PendingHotelApprovalCard
                    propertyDetails={propertyDetails}
                    vendor={vendor}
                    user={user}
                    businessDetails={businessDetails}
                    bankDetails={bankDetails}
                  />
                )}
                {/* Step 2: Verification Documents */}
                <StepSection
                  step={2}
                  vendorId={id}
                  vendorStatus={vendor?.status}
                  rejectedSteps={vendor?.rejectedSteps}
                  rejectionReasons={vendor?.rejectionReasons}
                  icon={<FileCheck size={16} className="text-primary" />}
                  title="Verification Documents"
                >
                  {documents && documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {documents.map((doc: any, idx: number) => (
                        <div
                          key={doc.id || doc._id || idx}
                          className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-card rounded-lg border border-border">
                              <CreditCard size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold truncate max-w-[140px]">
                                {doc.docName || "Document"}
                              </p>
                              <ImagePreview src={doc.docUrl}>
                                <button className="text-[10px] text-primary hover:underline font-bold text-left cursor-pointer">
                                  View File
                                </button>
                              </ImagePreview>
                            </div>
                          </div>
                          {doc.isVerified ? (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500"
                            />
                          ) : (
                            <ShieldAlert size={14} className="text-amber-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No documents uploaded
                    </p>
                  )}
                  {businessDetails?.panNumber && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          PAN
                        </p>
                        <p className="font-mono text-sm font-bold text-primary">
                          {businessDetails.panNumber}
                        </p>
                      </div>
                      {businessDetails?.aadhaarNumber && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Aadhaar
                          </p>
                          <p className="font-mono text-sm font-medium">
                            {businessDetails.aadhaarNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </StepSection>

                {/* Step 3: Bank Details */}
                <StepSection
                  step={3}
                  vendorId={id}
                  vendorStatus={vendor?.status}
                  rejectedSteps={vendor?.rejectedSteps}
                  rejectionReasons={vendor?.rejectionReasons}
                  icon={<Landmark size={16} className="text-primary" />}
                  title="Bank Details"
                >
                  {bankDetails ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoField
                        label="Bank Name"
                        value={bankDetails.bankName}
                      />
                      <InfoField
                        label="Branch"
                        value={bankDetails.branchName}
                      />
                      <InfoField
                        label="Account Holder"
                        value={bankDetails.accountHolderName}
                      />
                      <InfoField
                        label="Account Number"
                        value={bankDetails.accountNumber}
                        mono
                      />
                      <InfoField
                        label="IFSC Code"
                        value={bankDetails.ifscCode}
                        mono
                      />
                      {bankDetails.upiId && (
                        <InfoField
                          label="UPI ID"
                          value={bankDetails.upiId}
                          mono
                        />
                      )}
                      {bankDetails.verificationStatus && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Verification
                          </p>
                          <StatusBadge
                            status={bankDetails.verificationStatus}
                          />
                        </div>
                      )}
                      {bankDetails.proof?.url && (
                        <div className="col-span-2">
                          <ImagePreview src={bankDetails.proof.url}>
                            <button className="inline-flex items-center gap-2 py-2 px-3 border border-dashed border-border rounded-xl text-[10px] font-bold hover:bg-primary/5 transition-all cursor-pointer">
                              <ExternalLink size={12} /> View Bank Proof
                            </button>
                          </ImagePreview>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No bank details submitted
                    </p>
                  )}
                </StepSection>

                {/* Step 4: Property / Business Details */}
                <StepSection
                  step={4}
                  vendorId={id}
                  vendorStatus={vendor?.status}
                  rejectedSteps={vendor?.rejectedSteps}
                  rejectionReasons={vendor?.rejectionReasons}
                  icon={<Building2 size={16} className="text-primary" />}
                  title="Property Details"
                >
                  {propertyDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoField
                          label="Property Name"
                          value={propertyDetails.name}
                        />
                        <InfoField label="City" value={propertyDetails.city} />
                        <InfoField
                          label="Address"
                          value={formatAddress(propertyDetails.address)}
                        />
                        {propertyDetails.rank && (
                          <InfoField
                            label="Rank"
                            value={propertyDetails.rank}
                          />
                        )}
                        {propertyDetails.location?.coordinates && (
                          <InfoField
                            label="Coordinates"
                            value={`${propertyDetails.location.coordinates[1]}, ${propertyDetails.location.coordinates[0]}`}
                            mono
                          />
                        )}
                        {propertyDetails.verificationStatus && (
                          <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">
                              Verification
                            </p>
                            <StatusBadge
                              status={propertyDetails.verificationStatus}
                            />
                          </div>
                        )}
                      </div>
                      {propertyDetails.description && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                            Description
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {propertyDetails.description}
                          </p>
                        </div>
                      )}
                      {/* Interactive Gallery & Photo Indexing Panel */}
                      <div className="pt-2">
                        <AdminPropertyImageArranger
                          images={propertyDetails.images || []}
                          propertyName={
                            propertyDetails.name ||
                            businessDetails?.businessName ||
                            "Property"
                          }
                          onSave={handleSavePropertyImages}
                          saving={updatePropertyImagesMutation.isPending}
                        />
                      </div>
                      {propertyDetails.amenities?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Wifi size={12} /> Amenities
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {propertyDetails.amenities.map((a: any, idx: number) => {
                              const text =
                                typeof a === "object"
                                  ? a?.name || a?.label || JSON.stringify(a)
                                  : a;
                              return (
                                <span
                                  key={typeof a === "string" ? a : idx}
                                  className="text-[10px] font-bold bg-muted px-2 py-1 rounded-lg border border-border"
                                >
                                  {text}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {propertyDetails.features?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">
                            Features
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {propertyDetails.features.map(
                              (f: any, i: number) => {
                                const text =
                                  typeof f === "object"
                                    ? f?.name || f?.label || JSON.stringify(f)
                                    : f;
                                return (
                                  <span
                                    key={i}
                                    className="text-[10px] font-bold bg-muted px-2 py-1 rounded-lg border border-border"
                                  >
                                    {text}
                                  </span>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                      {propertyDetails.documents?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                            <FileCheck size={12} className="text-primary" />{" "}
                            Property Documents (
                            {propertyDetails.documents.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {propertyDetails.documents.map(
                              (doc: any, idx: number) => (
                                <div
                                  key={doc.id || doc._id || idx}
                                  className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-card rounded-lg border border-border">
                                      <CreditCard size={16} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold truncate max-w-[140px]">
                                        {doc.docName || "Document"}
                                      </p>
                                      <ImagePreview src={doc.docUrl}>
                                        <button className="text-[10px] text-primary hover:underline font-bold text-left cursor-pointer">
                                          View File
                                        </button>
                                      </ImagePreview>
                                    </div>
                                  </div>
                                  {doc.isVerified ? (
                                    <CheckCircle2
                                      size={14}
                                      className="text-emerald-500"
                                    />
                                  ) : (
                                    <ShieldAlert
                                      size={14}
                                      className="text-amber-500"
                                    />
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No property details submitted
                    </p>
                  )}
                </StepSection>

                {/* Final Approve / Full Reject */}
                <FinalActionCard vendor={vendor} id={id} />

                {/* Priority Rank & Promotion Section (Available when vendor is confirmed / approved) */}
                {vendor?.status === "approved" && (
                  <PropertyPromotionCard
                    vendor={vendor}
                    id={id}
                    serviceType={vendor?.serviceType || "hotel"}
                    serviceId={
                      businessId || propertyDetails?._id || propertyDetails?.id
                    }
                    propertyDetails={propertyDetails}
                    promotion={promotion}
                  />
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-4 space-y-3">
                {/* Owner */}
                <div className="bg-slate-950 rounded-2xl p-5 text-white border border-white/5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-sm font-black uppercase">
                        {user?.name?.[0] || "V"}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest leading-none">
                          Owner
                        </p>
                        <h3 className="text-sm font-bold truncate">
                          {user?.name || "Manager"}
                        </h3>
                      </div>
                    </div>
                    <div className="text-[11px] font-medium space-y-2">
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="text-slate-400">Email</span>
                        <span className="truncate ml-2">
                          {user?.email || "N/A"}
                        </span>
                      </div>
                      {user?.phone && (
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-slate-400">Phone</span>
                          <span className="ml-2">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Service</span>
                        <span className="bg-white/10 px-2 rounded uppercase text-[9px]">
                          {vendor?.serviceType || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Profile */}
                <div className="rounded-2xl p-4 shadow-sm space-y-3 border border-border">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase">
                      Business Profile
                    </h3>
                  </div>
                  <div className="text-[11px] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-semibold">
                        {businessDetails?.businessName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium truncate ml-2">
                        {businessDetails?.businessEmail || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">
                        {businessDetails?.businessPhone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City</span>
                      <span className="font-medium">
                        {businessDetails?.city || "N/A"}
                      </span>
                    </div>
                    {businessDetails?.state && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State</span>
                        <span className="font-medium">
                          {businessDetails.state}
                        </span>
                      </div>
                    )}
                    {businessDetails?.country && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium">
                          {businessDetails.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Rooms / Tour Packages Button */}
                {vendor?.status === "approved" &&
                (vendor?.serviceType === "hotel" ||
                  vendor?.serviceType === "tour") ? (
                  <Link
                    href={`/properties/${id}/listings${propertyDetails?._id ? `?propertyId=${propertyDetails._id}` : ""}`}
                    className="block"
                  >
                    <div className="rounded-2xl p-4 shadow-sm border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              vendor?.serviceType === "hotel"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-indigo-500/10 text-indigo-600"
                            }`}
                          >
                            {vendor?.serviceType === "hotel" ? (
                              <BedDouble size={18} />
                            ) : (
                              <Package size={18} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase">
                              {vendor?.serviceType === "hotel"
                                ? "View Rooms"
                                : "View Tour Packages"}
                            </h3>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[190px]">
                              {propertyDetails?.name
                                ? `Rooms for ${propertyDetails.name}`
                                : `See vendor-added ${
                                    vendor?.serviceType === "hotel"
                                      ? "room types"
                                      : "tour packages"
                                  }`}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  </Link>
                ) : vendor?.status === "approved" ? (
                  <div className="rounded-2xl p-4 shadow-sm border border-dashed border-border">
                    <p className="text-[11px] text-muted-foreground text-center italic">
                      No rooms/packages available for this service type
                    </p>
                  </div>
                ) : null}

                {/* Rejection Summary */}
                {vendor?.rejectedSteps?.length > 0 && (
                  <div className="rounded-2xl p-4 shadow-sm space-y-3 border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <h3 className="text-xs font-bold uppercase text-red-600">
                        Issues Found
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {vendor.rejectedSteps.map((step: number) => (
                        <div key={step} className="text-xs">
                          <p className="font-bold text-red-600">
                            Step {step}: {STEP_LABELS[step]}
                          </p>
                          <p className="text-red-500/80 mt-0.5">
                            {vendor.rejectionReasons?.[step] ||
                              "No reason provided"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

// ─── Step Section with Mark Issue / Verify controls ────────────────────────
function StepSection({
  step,
  vendorId,
  vendorStatus,
  rejectedSteps,
  rejectionReasons,
  icon,
  title,
  children,
}: {
  step: number;
  vendorId: string;
  vendorStatus?: string;
  rejectedSteps?: number[];
  rejectionReasons?: Record<number, string>;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const isApproved = vendorStatus === "approved";
  const markIssueMutation = useMarkIssue();
  const verifySectionMutation = useVerifySection();
  const [reason, setReason] = useState("");
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);

  const isRejected = rejectedSteps?.includes(step);
  const rejectionReason = rejectionReasons?.[step];

  const handleMarkIssue = async () => {
    if (!reason.trim()) return;
    try {
      await markIssueMutation.mutateAsync({
        vendorId,
        step,
        reason: reason.trim(),
      });
      toast.success(`Step ${step} marked with issue`);
      setReason("");
      setIssueDialogOpen(false);
    } catch {
      toast.error("Failed to mark issue");
    }
  };

  const handleVerify = async () => {
    try {
      await verifySectionMutation.mutateAsync({ vendorId, step });
      toast.success(`Step ${step} verified`);
    } catch {
      toast.error("Failed to verify section");
    }
  };

  return (
    <section
      className={`rounded-2xl shadow-sm overflow-hidden border ${isRejected ? "border-red-500/30" : "border-border"}`}
    >
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${isRejected ? "border-red-500/20 bg-red-500/5" : "border-border"}`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold uppercase tracking-tight">
            {title}
          </h2>
          <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Step {step}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isApproved ? (
            <Badge
              variant="outline"
              className="h-7 text-[10px] gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-200"
            >
              <CheckCircle2 className="h-3 w-3" /> Verified
            </Badge>
          ) : isRejected ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerify}
              disabled={verifySectionMutation.isPending}
              className="h-7 text-[10px] gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              {verifySectionMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              Clear Issue
            </Button>
          ) : (
            <AlertDialog
              open={issueDialogOpen}
              onOpenChange={setIssueDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <AlertTriangle className="h-3 w-3" /> Mark Issue
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark Issue — {title}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Provide a reason. The vendor will need to re-submit this
                    step.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  placeholder="Describe the issue..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setReason("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleMarkIssue}
                    disabled={!reason.trim() || markIssueMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {markIssueMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Mark Issue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Rejection banner */}
      {isRejected && rejectionReason && (
        <div className="px-4 py-2.5 bg-red-500/5 border-b border-red-500/10 flex items-start gap-2">
          <MessageSquare size={14} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-red-600 uppercase">
              Issue Reason
            </p>
            <p className="text-xs text-red-500/80">{rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="p-4">{children}</div>
    </section>
  );
}

// ─── Final Approve / Reject Card ───────────────────────────────────────────
function FinalActionCard({ vendor, id }: { vendor: any; id: string }) {
  const router = useRouter();
  const approveMutation = useApproveProperty();
  const rejectMutation = useRejectProperty();
  const blockMutation = useBlockProperty();
  const unblockMutation = useUnblockProperty();
  const deleteMutation = useDeleteProperty();

  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Vendor approved successfully");
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionType(null);
    }
  };

  const handleReject = async () => {
    try {
      const steps = vendor?.rejectedSteps || [2];
      const reasons = vendor?.rejectionReasons || { 2: "Issues found" };
      await rejectMutation.mutateAsync({ id, rejectedSteps: steps, reasons });
      toast.success("Vendor rejected");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionType(null);
    }
  };

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync({ id, reason: blockReason });
      toast.success("Vendor and property blocked successfully");
      setBlockDialogOpen(false);
      setBlockReason("");
    } catch {
      toast.error("Failed to block vendor");
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockMutation.mutateAsync(id);
      toast.success("Vendor and property unblocked successfully");
      setUnblockDialogOpen(false);
    } catch {
      toast.error("Failed to unblock vendor");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Property moved to deleted history");
      setDeleteDialogOpen(false);
      RouterPush(router, "/properties");
    } catch {
      toast.error("Failed to delete property");
    }
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending;
  const isBlocked = vendor?.status === "blocked";

  return (
    <div className="rounded-xl p-5 space-y-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <ShieldCheck size={15} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Review & Status
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Manage property visibility and administrative status
            </p>
          </div>
        </div>
      </div>

      {isBlocked ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1 sm:mt-0 ring-4 ring-rose-500/10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Property & Vendor Blocked
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-medium">
                  Inactive
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {vendor?.blockReason
                  ? `Reason: ${vendor.blockReason}`
                  : "Hidden from all customer searches, frames, and categories."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setUnblockDialogOpen(true)}
              disabled={unblockMutation.isPending}
              className="h-8 text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors"
            >
              <Unlock className="h-3.5 w-3.5 mr-1.5" />
              Unblock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
              className="h-8 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      ) : vendor?.status === "approved" ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1 sm:mt-0 ring-4 ring-emerald-500/10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Live & Approved
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300/80 dark:border-zinc-700 font-mono">
                  Public
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                This listing is active and publicly discoverable across search
                and categories.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBlockDialogOpen(true)}
              disabled={blockMutation.isPending}
              className="h-8 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Ban className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Block Property
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
              className="h-8 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Property
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {vendor?.rejectedSteps?.length > 0 && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {vendor.rejectedSteps.length} step(s) have issues flagged.
              Rejecting will notify the vendor.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <WarningDialog
              open={actionType === "reject"}
              onOpenChange={(o) => !o && setActionType(null)}
              loading={isMutating}
              title="Reject Vendor?"
              description="The vendor will be notified and must re-submit flagged steps."
              func={handleReject}
              trigger={
                <button
                  onClick={() => setActionType("reject")}
                  disabled={isMutating}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all text-xs font-medium disabled:opacity-50 cursor-pointer"
                >
                  <ShieldAlert size={14} className="text-zinc-500" />
                  <span>Reject Vendor</span>
                </button>
              }
            />
            {vendor?.status !== "approved" && (
              <WarningDialog
                open={actionType === "approve"}
                onOpenChange={(o) => !o && setActionType(null)}
                loading={isMutating}
                title="Approve Vendor?"
                description="All sections will be verified and listing goes live."
                func={handleApprove}
                trigger={
                  <button
                    onClick={() => setActionType("approve")}
                    disabled={isMutating}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-all text-xs font-medium disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve & Publish</span>
                  </button>
                }
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBlockDialogOpen(true)}
              disabled={blockMutation.isPending}
              className="text-xs h-8 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <Ban className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Block Vendor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
              className="text-xs h-8 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Property
            </Button>
          </div>
        </div>
      )}

      {/* Block Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 text-base font-semibold">
              Block Property & Vendor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Blocking this vendor deactivates their listing immediately. Their
              property will no longer appear in customer search results, home
              pages, or categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Reason for blocking (optional):
            </label>
            <Input
              placeholder="e.g. Terms violation, policy breach"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="text-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={blockMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={blockMutation.isPending}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-xs font-semibold"
            >
              {blockMutation.isPending ? "Blocking..." : "Block Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 text-base font-semibold">
              Unblock Property & Vendor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              This will restore the property and vendor account to active
              status, allowing their listings to be visible again on frontend
              search and category pages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unblockMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblock}
              disabled={unblockMutation.isPending}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-xs font-semibold"
            >
              {unblockMutation.isPending ? "Unblocking..." : "Unblock Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 text-base font-semibold">
              Delete Property Listing?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              This permanently removes the property listing, associated
              rooms/packages, and vendor account from live inventory. A basic
              record will be archived in the Deleted History tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────
function InfoField({
  label,
  value,
  mono,
}: {
  label: string;
  value?: any;
  mono?: boolean;
}) {
  const displayValue =
    value && typeof value === "object"
      ? formatAddress(value) || "N/A"
      : value || "N/A";

  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`text-sm font-medium text-zinc-900 dark:text-zinc-100 ${mono ? "font-mono" : ""}`}
      >
        {displayValue}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    approved:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    blocked:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    verified:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    pending:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    under_review:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
    draft:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border ${styles[status || ""] || styles.pending}`}
    >
      {status?.replace(/_/g, " ") || "pending"}
    </span>
  );
}

// ─── Property Promotion & Rank Assignment Card ────────────────────────────
function PropertyPromotionCard({
  vendor,
  id,
  serviceType,
  serviceId,
  propertyDetails,
  promotion,
}: {
  vendor: any;
  id: string;
  serviceType: string;
  serviceId: string;
  propertyDetails: any;
  promotion: any;
}) {
  const assignPromotionMutation = useAssignPromotion();
  const [isOpen, setIsOpen] = useState(false);
  const currentRank = propertyDetails?.rank || promotion?.rank || "";
  const [selectedRank, setSelectedRank] = useState<string>(currentRank || "A");

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    if (promotion?.startDate && promotion?.endDate) {
      return {
        from: new Date(promotion.startDate),
        to: new Date(promotion.endDate),
      };
    }
    return {
      from: today,
      to: addDays(today, 30),
    };
  });

  const handleApplyRank = async () => {
    if (!selectedRank) {
      toast.error("Please select a rank tier");
      return;
    }
    const targetServiceId =
      serviceId || propertyDetails?._id || propertyDetails?.id;
    if (!targetServiceId) {
      toast.error("Service listing ID not found");
      return;
    }

    try {
      await assignPromotionMutation.mutateAsync({
        vendorId: id,
        serviceType: serviceType || vendor?.serviceType || "hotel",
        serviceId: targetServiceId,
        rank: selectedRank,
        startDate: dateRange?.from || new Date(),
        endDate: dateRange?.to,
      });
      toast.success(`Assigned Rank ${selectedRank} successfully`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign rank");
    }
  };

  const rankTierMeta: Record<string, { label: string; desc: string }> = {
    A: {
      label: "Category A — Top Placement",
      desc: "Prime visibility across featured spots, top category results, and recommendations",
    },
    B: {
      label: "Category B — Elevated Rank",
      desc: "Promoted search placement elevated above standard verified listings",
    },
    C: {
      label: "Category C — Standard Tier",
      desc: "Baseline verified ranking according to organic user review criteria",
    },
  };

  return (
    <div className="rounded-xl p-5 space-y-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <Award size={15} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Promotion & Search Ranking
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Configure search placement priority and promotional schedule
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentRank ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              Rank {currentRank}
            </span>
          ) : (
            <span className="text-xs text-zinc-400 font-mono">Unranked</span>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 px-3 text-xs font-medium border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            {isOpen
              ? "Close"
              : currentRank
                ? "Change Rank / Duration"
                : "Assign Rank"}
          </Button>
        </div>
      </div>

      {/* Current Active Promotion Summary */}
      {currentRank && !isOpen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400">
              Priority Tier:
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Category {currentRank} —{" "}
              {currentRank === "A"
                ? "Top Priority"
                : currentRank === "B"
                  ? "Elevated Rank"
                  : "Standard Tier"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
            <CalendarIcon size={13} className="text-zinc-400" />
            <span>
              Duration:{" "}
              {promotion?.startDate
                ? `${format(new Date(promotion.startDate), "dd MMM yyyy")} → ${
                    promotion.endDate
                      ? format(new Date(promotion.endDate), "dd MMM yyyy")
                      : "Ongoing"
                  }`
                : "Active"}
            </span>
          </div>
        </div>
      )}

      {/* Assign Rank Panel */}
      {isOpen && (
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
              Select Promotion Tier
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["A", "B", "C"] as const).map((r) => {
                const conf = rankTierMeta[r];
                const isSelected = selectedRank === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRank(r)}
                    className={cn(
                      "p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer",
                      isSelected
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100/80 dark:bg-zinc-900 shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                        Rank {r}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          size={15}
                          className="text-zinc-900 dark:text-zinc-100"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {conf.label}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {conf.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Picker with Shadcn Range Calendar */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Promotion Duration
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[280px] justify-start text-left font-normal text-xs h-9 gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span>
                          {format(dateRange.from, "LLL dd, y")} –{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </span>
                      ) : (
                        <span>From {format(dateRange.from, "LLL dd, y")}</span>
                      )
                    ) : (
                      <span className="text-zinc-400">Pick duration</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl"
                  align="start"
                >
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from || new Date()}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => {
                      const yesterday = new Date();
                      yesterday.setHours(0, 0, 0, 0);
                      return date < yesterday;
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { label: "7 Days", days: 7 },
                  { label: "15 Days", days: 15 },
                  { label: "30 Days", days: 30 },
                  { label: "90 Days", days: 90 },
                ].map((preset) => (
                  <Button
                    key={preset.days}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] px-2.5 rounded-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    onClick={() => {
                      const today = new Date();
                      setDateRange({
                        from: today,
                        to: addDays(today, preset.days),
                      });
                    }}
                  >
                    +{preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-xs h-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={assignPromotionMutation.isPending || !selectedRank}
              onClick={handleApplyRank}
              className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white h-8 px-4 gap-1.5"
            >
              {assignPromotionMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              )}
              Confirm Rank {selectedRank}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PropertyDetailContent />
    </Suspense>
  );
}
