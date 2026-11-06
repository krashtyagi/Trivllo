"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  UploadCloud,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  Info,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { axiosApi } from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

interface AdvertisementBannerSectionProps {
  propertyName?: string;
  serviceType?: string;
  city?: string;
  initialAdImage?: { url: string; public_id?: string; resource_type?: string } | null;
  fallbackImageUrl?: string | null;
  onUpdated?: (newImage: { url: string; public_id?: string } | null) => void;
}

export function AdvertisementBannerSection({
  propertyName = "Featured Property",
  serviceType = "Service",
  city = "India",
  initialAdImage = null,
  fallbackImageUrl = null,
  onUpdated,
}: AdvertisementBannerSectionProps) {
  const { uploadFile } = useAuthStore();
  const [adImage, setAdImage] = useState<{
    url: string;
    public_id?: string;
  } | null>(initialAdImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayViewport, setOverlayViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAdImage(initialAdImage || null);
  }, [initialAdImage]);

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
        if (onUpdated) onUpdated(newImg);
      } else {
        throw new Error(res.data?.message || "Failed to save banner image");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to update advertisement banner"
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
        toast.success("Advertisement banner removed. Using standard gallery photos.");
        setAdImage(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onUpdated) onUpdated(null);
      } else {
        throw new Error(res.data?.message || "Failed to remove banner image");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to remove advertisement banner"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeDisplayUrl = previewUrl || adImage?.url || fallbackImageUrl || null;
  const hasCustomAd = Boolean(adImage?.url);
  const isLocalPreview = Boolean(previewUrl);

  return (
    <>
      <Card className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 sm:p-7 flex flex-col gap-5 shadow-xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-300 border border-zinc-800">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100 tracking-tight">
                  Promotional Advertisement Banner
                </h2>
                {hasCustomAd && (
                  <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-medium">
                    Custom Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                High-definition banner featured on homepage slideshow carousels (Rank A, B, C)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOverlayOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
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
              Consumer View Preview
            </span>
            {isLocalPreview ? (
              <span className="text-amber-400 font-medium text-[11px]">
                ● Unsaved image selected
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
            className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner bg-zinc-900 group cursor-pointer"
          >
            {activeDisplayUrl ? (
              <img
                src={activeDisplayUrl}
                alt="Advertisement Banner Preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-6 text-center">
                <div className="p-3.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 mb-2">
                  <ImageIcon className="h-7 w-7 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-200">No Custom Banner Uploaded</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Upload a high-impact landscape photo to stand out on category pages
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
                <h3 className="text-base sm:text-xl font-bold text-white leading-tight truncate">
                  {propertyName}
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  {city} • {serviceType.toUpperCase()}
                </p>
              </div>

              <div className="shrink-0 hidden xs:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/80 backdrop-blur-md text-zinc-200 text-xs font-medium">
                <span>View Details</span>
                <ArrowRight className="h-3 w-3 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4 text-zinc-400" />
              <span>{hasCustomAd || isLocalPreview ? "Change Image" : "Upload Banner Image"}</span>
            </button>

            {isLocalPreview && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
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
                  className="px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
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
                className="px-3 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/60 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
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
            <span>Recommended: 16:9 landscape format • Max 5MB (JPG, PNG, WEBP)</span>
          </div>
        </div>
      </Card>

      {/* ── Overlay Preview Dialog ────────────────────────────────────── */}
      <Dialog open={isOverlayOpen} onOpenChange={setIsOverlayOpen}>
        <DialogContent className="max-w-4xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 sm:p-7 rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-zinc-800 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-lg font-bold text-zinc-100">
                  Advertisement Banner Overlay Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  Live consumer-side presentation across responsive viewports.
                </DialogDescription>
              </div>

              {/* Viewport Toggles */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOverlayViewport("desktop")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                  ? "max-w-sm h-60"
                  : overlayViewport === "tablet"
                  ? "max-w-xl h-68"
                  : "max-w-full h-80 sm:h-92"
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
                  <ImageIcon className="h-9 w-9 text-zinc-600 mb-2" />
                  <p className="text-sm font-semibold text-zinc-300">No Custom Banner Image</p>
                  <p className="text-xs text-zinc-500 mt-1">Upload a banner to test live slideshow</p>
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
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight truncate">
                    {propertyName}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                    {city} • {serviceType.toUpperCase()}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/90 backdrop-blur-md text-zinc-200 text-xs font-medium">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>10-second slideshow interval • Automatic Ken Burns image animation</span>
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
}
