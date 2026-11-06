"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Building,
  CreditCard,
  MapPin,
  Star,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Mail,
  User,
  Layers,
  DollarSign,
  Users,
  Sparkles,
  UploadCloud,
  Trash2,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  Info,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet,
  SlidersHorizontal,
} from "lucide-react";
import { axiosApi } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface VendorData {
  vendor: {
    vendorId: string;
    name: string;
    email: string;
    businessName: string;
    serviceType: string;
    status: string;
  };
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    upiId: string;
    verificationStatus: string;
  } | null;
  serviceDetails: {
    id: string;
    name: string;
    description: string;
    address: string | any;
    city: string | null;
    rating: number;
    verificationStatus: string;
    isActive: boolean;
    advertisementImage?: {
      url: string;
      public_id?: string;
      resource_type?: string;
    } | null;
    images?: Array<{
      url: string;
      public_id?: string;
    }>;
  } | null;
  subServices: Array<{
    id: string;
    name: string;
    basePrice?: number;
    discountPrice?: number;
    pricePerDay?: number;
    capacity?: any;
    carName?: string;
    cabType?: string;
    bikeName?: string;
    bikeType?: string;
    type?: string;
    duration?: any;
    isActive: boolean;
  }>;
}

// ─── Advertisement Banner Section ─────────────────────────────────────
const AdvertisementBannerSection = ({
  serviceDetails,
  vendor,
  onUpdated,
}: {
  serviceDetails: VendorData["serviceDetails"];
  vendor: VendorData["vendor"];
  onUpdated: (newImage: { url: string; public_id?: string } | null) => void;
}) => {
  const { uploadFile } = useAuthStore();
  const [adImage, setAdImage] = useState<{
    url: string;
    public_id?: string;
  } | null>(serviceDetails?.advertisementImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayViewport, setOverlayViewport] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAdImage(serviceDetails?.advertisementImage || null);
  }, [serviceDetails?.advertisementImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelSelected = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file first");
      return;
    }

    setIsSaving(true);
    try {
      const uploadRes = await uploadFile(selectedFile, "advertisements");
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.message || "Failed to upload image");
      }

      const res = await axiosApi.patch("/vendors/advertisement-image", {
        advertisementImage: {
          url: uploadRes.url,
          public_id: uploadRes.public_id || "",
          resource_type: uploadRes.resource_type || "image",
        },
      });

      if (res.data?.success) {
        toast.success("Advertisement banner image updated successfully!");
        const newImg = { url: uploadRes.url, public_id: uploadRes.public_id };
        setAdImage(newImg);
        setSelectedFile(null);
        setPreviewUrl(null);
        onUpdated(newImg);
      } else {
        throw new Error(res.data?.message || "Failed to save banner image");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update advertisement banner",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const res = await axiosApi.patch("/vendors/advertisement-image", {
        advertisementImage: null,
      });

      if (res.data?.success) {
        toast.success(
          "Advertisement banner removed. Using standard gallery photos.",
        );
        setAdImage(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onUpdated(null);
      } else {
        throw new Error(res.data?.message || "Failed to remove banner image");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove advertisement banner",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeDisplayUrl =
    previewUrl || adImage?.url || serviceDetails?.images?.[0]?.url || null;
  const hasCustomAd = Boolean(adImage?.url);
  const isLocalPreview = Boolean(previewUrl);

  return (
    <>
      <Card className="bg-zinc-950 border border-zinc-800/90 rounded-[1.8rem] p-6 sm:p-8 flex flex-col gap-6 shadow-xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-2xl text-zinc-300 border border-zinc-800">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                  Promotional Advertisement Banner
                </h2>
                {hasCustomAd && (
                  <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-medium tracking-wide">
                    Custom Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                High-definition banner featured on homepage category slideshows
                (Rank A, B, C)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOverlayOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Preview on Overlay</span>
            </button>
          </div>
        </div>

        {/* Banner Preview Frame */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium flex items-center gap-1.5 text-zinc-300">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
              Live Consumer View
            </span>
            {isLocalPreview ? (
              <span className="text-amber-400 font-medium text-[11px]">
                ● Unsaved file selected
              </span>
            ) : hasCustomAd ? (
              <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Active custom image
              </span>
            ) : (
              <span className="text-zinc-500 text-[11px]">
                Defaulting to property gallery photo
              </span>
            )}
          </div>

          {/* Simulated Consumer Banner Box */}
          <div
            onClick={() => setIsOverlayOpen(true)}
            className="relative w-full h-48 sm:h-64 md:h-72 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner bg-zinc-900 group cursor-pointer"
          >
            {activeDisplayUrl ? (
              <img
                src={activeDisplayUrl}
                alt="Advertisement Banner Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
                <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mb-3">
                  <ImageIcon className="h-8 w-8 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-200">
                  No Custom Banner Uploaded
                </p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Upload a high-impact landscape photo to stand out on category
                  pages
                </p>
              </div>
            )}

            {/* Muted dark gradients matching luxury presentation */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 pointer-events-none" />

            {/* Badge top-left */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-zinc-200 bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md shadow-sm">
                ★ Featured Property
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium text-zinc-400 bg-black/60 border border-zinc-800 backdrop-blur-md">
                10s Slideshow
              </span>
            </div>

            {/* Expand hint top-right */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-zinc-300 bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-3 w-3 text-zinc-400" />
                Click to Expand
              </span>
            </div>

            {/* Bottom Simulated Content */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight truncate">
                  {serviceDetails?.name || vendor.businessName}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                  {serviceDetails?.city || "India"} •{" "}
                  {vendor.serviceType.toUpperCase()}
                </p>
              </div>

              <div className="shrink-0 hidden xs:flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/80 backdrop-blur-md text-zinc-200 text-xs font-medium">
                <span>View Details</span>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Action Toolbar & Advice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-zinc-800">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4 text-zinc-400" />
              <span>
                {hasCustomAd || isLocalPreview
                  ? "Change Image"
                  : "Upload Banner Image"}
              </span>
            </button>

            {isLocalPreview && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Save Banner</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelSelected}
                  disabled={isSaving}
                  className="px-3 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}

            {hasCustomAd && !isLocalPreview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSaving}
                className="px-3.5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/60 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>
              Recommended: 16:9 landscape format • Max 5MB (JPG, PNG, WEBP)
            </span>
          </div>
        </div>
      </Card>

      {/* ── Overlay Preview Dialog ────────────────────────────────────── */}
      <Dialog open={isOverlayOpen} onOpenChange={setIsOverlayOpen}>
        <DialogContent className="max-w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-zinc-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-100">
                  Advertisement Banner Overlay Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-1">
                  Live presentation preview across homepage slideshow carousels.
                </DialogDescription>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOverlayViewport("desktop")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    overlayViewport === "desktop"
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOverlayViewport("tablet")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    overlayViewport === "tablet"
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOverlayViewport("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    overlayViewport === "mobile"
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Responsive Simulated Frame */}
          <div className="py-4 flex items-center justify-center">
            <div
              className={`transition-all duration-300 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 relative shadow-2xl ${
                overlayViewport === "mobile"
                  ? "max-w-sm h-64"
                  : overlayViewport === "tablet"
                    ? "max-w-2xl h-72"
                    : "max-w-full h-80 sm:h-96"
              }`}
            >
              {activeDisplayUrl ? (
                <img
                  src={activeDisplayUrl}
                  alt="Overlay Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-8 text-center">
                  <ImageIcon className="h-10 w-10 text-zinc-600 mb-2" />
                  <p className="text-sm font-semibold text-zinc-300">
                    No Custom Banner Image
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Upload a banner to test live slideshow
                  </p>
                </div>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 pointer-events-none" />

              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-zinc-200 bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md">
                  ★ Promoted Banner
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight truncate">
                    {serviceDetails?.name || vendor.businessName}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    {serviceDetails?.city || "India"} •{" "}
                    {vendor.serviceType.toUpperCase()}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700 bg-zinc-900/90 backdrop-blur-md text-zinc-200 text-xs font-medium">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                10-second slideshow interval • Automatic Ken Burns image
                animation
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverlayOpen(false)}
              className="border-zinc-800 hover:bg-zinc-900 text-zinc-300"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

function ListingPage() {
  const [data, setData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axiosApi.get("/vendors/my-listing");
        if (res.data && res.data.success) {
          setData(res.data.data);
        } else {
          setError("Failed to load listing details.");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch listing data.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Loading your listing details...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-950 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Error Loading Listing
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md">
          {error ||
            "Unable to retrieve your business listing details at this moment. Please try again later."}
        </p>
      </div>
    );
  }

  const { vendor, bankDetails, serviceDetails, subServices } = data;

  const handleAdImageUpdated = (
    newImage: { url: string; public_id?: string } | null,
  ) => {
    setData((prev) => {
      if (!prev || !prev.serviceDetails) return prev;
      return {
        ...prev,
        serviceDetails: {
          ...prev.serviceDetails,
          advertisementImage: newImage,
        },
      };
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60";
      case "rejected":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/60";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";
    }
  };

  const renderPrice = (item: any) => {
    if (item.basePrice !== undefined) {
      return `₹${item.basePrice}`;
    }
    if (item.pricePerDay !== undefined) {
      return `₹${item.pricePerDay}/day`;
    }
    return "N/A";
  };

  const renderCapacity = (capacity: any) => {
    if (!capacity) return null;
    if (typeof capacity === "object") {
      const parts = [];
      if (capacity.adults) parts.push(`${capacity.adults} Adults`);
      if (capacity.children) parts.push(`${capacity.children} Kids`);
      return parts.length > 0 ? parts.join(", ") : "N/A";
    }
    return `${capacity} guests`;
  };

  const renderDuration = (duration: any) => {
    if (!duration) return null;
    if (typeof duration === "object") {
      const parts = [];
      if (duration.days !== undefined && duration.days !== null) {
        parts.push(`${duration.days} ${duration.days === 1 ? "Day" : "Days"}`);
      }
      if (duration.nights !== undefined && duration.nights !== null) {
        parts.push(
          `${duration.nights} ${duration.nights === 1 ? "Night" : "Nights"}`,
        );
      }
      if (duration.hours !== undefined && duration.hours !== null) {
        parts.push(`${duration.hours} hrs`);
      }
      if (parts.length > 0) return parts.join(" / ");
      return JSON.stringify(duration);
    }
    return String(duration);
  };

  const formatAddress = (addr: any, city?: string | null) => {
    if (!addr) return city || "Address not provided";
    if (typeof addr === "string") {
      return city && !addr.toLowerCase().includes(city.toLowerCase())
        ? `${addr}, ${city}`
        : addr;
    }
    if (typeof addr === "object") {
      if (addr.formattedAddress) return addr.formattedAddress;
      const parts = [
        addr.buildingName,
        addr.doorNumber,
        addr.streetAddress,
        addr.areaName,
        addr.city || city,
        addr.district,
        addr.state,
        addr.country,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : city || "Address not provided";
    }
    return String(addr);
  };

  return (
    <div className="py-2 px-2 sm:px-2 lg:px-3 w-full mx-auto min-h-screen flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Listing
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Overview of your business listing, billing, and registered catalog
            offerings.
          </p>
        </div>
        <div className="flex gap-2.5 items-center">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase border ${getStatusStyle(vendor.status)}`}
          >
            Vendor: {vendor.status}
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
            {vendor.serviceType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
        <div className="lg:col-span-2 flex flex-col gap-2">
          <Card className="bg-white dark:bg-zinc-950 rounded-[1.8rem] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-800/80">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {vendor.businessName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Registered Business Details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100/80 dark:border-zinc-800/60">
                <User className="h-4 w-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Contact Person
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                    {vendor.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100/80 dark:border-zinc-800/60">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Business Email
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                    {vendor.email}
                  </p>
                </div>
              </div>
            </div>

            {serviceDetails && (
              <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {serviceDetails.name}
                  </h3>
                  {serviceDetails.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                      {serviceDetails.description}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                  <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    {formatAddress(serviceDetails.address, serviceDetails.city)}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Advertisement Banner Section with Live Simulation */}
          <AdvertisementBannerSection
            serviceDetails={serviceDetails}
            vendor={vendor}
            onUpdated={handleAdImageUpdated}
          />

          <Card className="bg-white dark:bg-zinc-950 rounded-[1.8rem] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-800/80">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    Catalog Offerings
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Manage inventory and item pricing status
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {subServices.length}{" "}
                {subServices.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {subServices.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-zinc-500 dark:text-zinc-400 text-sm">
                No catalog services or items registered under this listing.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subServices.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700/80 rounded-2xl bg-white dark:bg-zinc-950/40 transition-all duration-200 flex flex-col justify-between gap-4"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 truncate text-base">
                          {item.name}
                        </h4>
                        {(item.carName || item.bikeName) && (
                          <p className="text-xs text-zinc-400 mt-0.5 truncate">
                            Vehicle: {item.carName || item.bikeName}{" "}
                            {item.cabType || item.bikeType
                              ? `(${item.cabType || item.bikeType})`
                              : ""}
                          </p>
                        )}
                        {item.type && (
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Type: {item.type}
                          </p>
                        )}
                        {item.duration && (
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Duration: {renderDuration(item.duration)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase shrink-0 ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                            : "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800/80"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-900/60 pt-3 text-sm">
                      <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold">
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                        <span>{renderPrice(item)}</span>
                        {item.discountPrice && (
                          <span className="text-xs text-zinc-400 line-through font-normal ml-1">
                            ₹{item.discountPrice}
                          </span>
                        )}
                      </div>
                      {item.capacity && (
                        <div className="flex items-center gap-1 text-zinc-400 text-xs">
                          <Users className="h-3.5 w-3.5" />
                          <span>{renderCapacity(item.capacity)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-2">
          {serviceDetails && (
            <Card className="bg-white dark:bg-zinc-950 rounded-[1.8rem] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 shadow-xs">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Listing Reputation
              </h3>
              <div className="flex items-center gap-4 py-2">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-500 border border-amber-100 dark:border-amber-900/20">
                  <Star className="h-8 w-8 fill-amber-500" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {serviceDetails.rating?.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Average Traveler Rating
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-white dark:bg-zinc-950 rounded-[1.8rem] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-800/80">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                  Payout Account
                </h3>
                <p className="text-[10px] text-zinc-400">
                  Bank details for automated payouts
                </p>
              </div>
            </div>

            {bankDetails ? (
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Account Holder
                  </p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {bankDetails.accountHolderName}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Bank Name
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {bankDetails.bankName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      Account Number
                    </p>
                    <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                      {bankDetails.accountNumber}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      IFSC Code
                    </p>
                    <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                      {bankDetails.ifscCode}
                    </p>
                  </div>
                </div>

                {bankDetails.upiId && (
                  <div className="space-y-1 border-t border-zinc-50 dark:border-zinc-900/60 pt-3">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      UPI Address
                    </p>
                    <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                      {bankDetails.upiId}
                    </p>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-900/10">
                  {bankDetails.verificationStatus === "verified" ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                        Bank details verified and active
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium uppercase text-[10px]">
                        Verification: {bankDetails.verificationStatus}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-2">
                <XCircle className="h-8 w-8 text-zinc-300" />
                <span>No payout account setup found</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ListingPage;
