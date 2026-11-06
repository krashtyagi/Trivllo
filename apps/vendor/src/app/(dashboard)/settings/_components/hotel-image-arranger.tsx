"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  X,
  UploadCloud,
  Loader2,
  Eye,
  ArrowUpDown,
  Maximize2,
  Star,
  ImageIcon,
  LayoutGrid,
  Save,
  Trash2,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface HotelImageItem {
  url: string;
  public_id?: string;
  resource_type?: string;
  [key: string]: any;
}

interface HotelImageArrangerProps {
  images: HotelImageItem[];
  onChange: (images: HotelImageItem[]) => void;
  onSave?: (imagesToSave?: HotelImageItem[]) => Promise<void> | void;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  saving?: boolean;
  uploading?: boolean;
  propertyName?: string;
}

export function HotelImageArranger({
  images,
  onChange,
  onSave,
  onUpload,
  saving = false,
  uploading = false,
  propertyName = "Property",
}: HotelImageArrangerProps) {
  const [activeTab, setActiveTab] = useState<"arrange" | "preview">("arrange");
  const [previewVariant, setPreviewVariant] = useState<"desktop" | "mobile">("desktop");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep track of dirty state
  const handleImagesChange = (updated: HotelImageItem[]) => {
    setHasChanges(true);
    onChange(updated);
  };

  // Reorder helper: moves item from `fromIndex` to `toIndex`
  const moveImageToIndex = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    handleImagesChange(updated);
  };

  // 1-Click Promote to Cover (Index 0)
  const makeCoverPhoto = (fromIndex: number) => {
    if (fromIndex === 0) return;
    moveImageToIndex(fromIndex, 0);
  };

  // Remove single image
  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    handleImagesChange(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveImageToIndex(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save handler that resets the dirty state on success
  const handleSaveClick = async () => {
    if (!onSave) return;
    try {
      await onSave(images);
      setHasChanges(false);
    } catch {
      // error handled in caller
    }
  };

  // Helper labels matching frontend layout
  const getSlotInfo = (index: number) => {
    if (index === 0) {
      return {
        label: "Cover Photo",
        badgeClass: "bg-foreground text-background border-foreground font-semibold",
        description: "Large hero on page & card thumbnail",
        isCover: true,
      };
    }
    if (index <= 4) {
      return {
        label: `Grid ${index}`,
        badgeClass: "bg-muted text-foreground border-border/80 font-medium",
        description: `Showcase 2×2 grid slot ${index}`,
        isCover: false,
      };
    }
    return {
      label: `Gallery ${index + 1}`,
      badgeClass: "bg-muted/60 text-muted-foreground border-border/40 font-normal",
      description: "Full photo drawer view",
      isCover: false,
    };
  };

  const featuredImage = images[0]?.url;
  const gridImages = images.slice(1, 5);
  const remainingCount = Math.max(0, images.length - 5);

  return (
    <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
      {/* ── CARD HEADER ──────────────────────────────────────────────── */}
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Property Gallery Photos
              </CardTitle>
              {images.length > 0 && (
                <Badge variant="outline" className="text-[11px] h-5 px-2 font-mono">
                  {images.length} {images.length === 1 ? "photo" : "photos"}
                </Badge>
              )}
              {hasChanges && (
                <Badge className="text-[10px] h-5 px-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-1">
              Position #1 is your public Cover Photo. Positions #2–#5 fill the main showcase grid.
            </CardDescription>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* View Switcher */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-auto"
            >
              <TabsList className="h-8 bg-muted/60">
                <TabsTrigger value="arrange" className="text-xs px-3 h-7 gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Arrange
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-3 h-7 gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 text-xs gap-1.5 border-border/80 hover:bg-muted"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5 text-primary" />
              )}
              <span>Upload</span>
            </Button>

            {/* Save Button */}
            {onSave && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveClick}
                disabled={saving}
                className={cn(
                  "h-8 text-xs gap-1.5 font-medium transition-all shadow-sm",
                  hasChanges
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 ring-2 ring-primary/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Photos</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {activeTab === "arrange" ? (
          /* ── ARRANGE & REORDER VIEW ──────────────────────────────── */
          <div className="space-y-4">
            {/* Guide strip */}
            <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>Tip:</strong> Drag cards or use arrows to change photo order. The first image is always shown as the main hero cover on your listing.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border font-medium text-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  #1 Cover
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                  #2–#5 Grid
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                  #6+ Gallery
                </span>
              </div>
            </div>

            {/* Empty State */}
            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 p-12 text-center transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold mb-1">No property photos uploaded yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Upload high quality photos of your hotel lobby, exterior, rooms, amenities, and surroundings.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  className="text-xs gap-1.5 border-primary/30 text-primary"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Select Photos to Upload
                </Button>
              </div>
            ) : (
              /* Photo Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {images.map((img, index) => {
                  const slot = getSlotInfo(index);
                  const isDragging = draggedIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <div
                      key={img.public_id || `${img.url}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group relative rounded-xl border overflow-hidden bg-card transition-all duration-200 select-none",
                        slot.isCover
                          ? "border-primary/60 shadow-sm ring-1 ring-primary/20"
                          : "border-border/70 hover:border-border",
                        isDragging && "opacity-40 scale-95",
                        isOver && "border-primary ring-2 ring-primary/30"
                      )}
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                        <img
                          src={img.url}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Drag Handle Overlay */}
                        <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 rounded-md bg-black/60 backdrop-blur-sm text-white/90 hover:text-white hover:bg-black/80 transition-colors">
                          <GripVertical className="h-3.5 w-3.5" />
                        </div>

                        {/* Slot Badge */}
                        <div className="absolute top-2 right-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] backdrop-blur-sm border shadow-sm",
                              slot.isCover
                                ? "bg-black/80 text-white border-white/20 font-semibold"
                                : "bg-black/60 text-white/90 border-white/10"
                            )}
                          >
                            {slot.isCover && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />}
                            {slot.label}
                          </span>
                        </div>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedImageModal(img.url)}
                          className="absolute bottom-2 left-2 p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80"
                          title="View enlarged"
                        >
                          <Maximize2 className="h-3 w-3" />
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Delete photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Card Bottom Controls */}
                      <div className="p-2.5 flex items-center justify-between border-t border-border/50 bg-background/80 text-xs">
                        {/* 1-Click Set as Cover */}
                        {!slot.isCover ? (
                          <button
                            type="button"
                            onClick={() => makeCoverPhoto(index)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="Make this the main cover photo"
                          >
                            <Star className="h-3 w-3" />
                            <span>Set as Cover</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                            <Star className="h-3 w-3 fill-primary" />
                            <span>Primary Cover</span>
                          </span>
                        )}

                        {/* Position Move Arrows */}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveImageToIndex(index, index - 1)}
                            className="p-1 rounded hover:bg-muted disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            title="Move left"
                          >
                            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <span className="text-[11px] font-mono text-muted-foreground min-w-[1.5ch] text-center">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === images.length - 1}
                            onClick={() => moveImageToIndex(index, index + 1)}
                            className="p-1 rounded hover:bg-muted disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            title="Move right"
                          >
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Additional Drag & Drop Upload Tile */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-dashed border-border/70 hover:border-primary/50 bg-muted/10 hover:bg-muted/30 aspect-[16/10] sm:aspect-auto sm:min-h-[160px] flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-2">
                    <UploadCloud className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    Add More Photos
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Click to browse files
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── PREVIEW VIEW (Matches frontend imsges.tsx) ─────────────── */
          <div className="space-y-4">
            <div className="px-3 py-2 bg-muted/40 border border-border/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>
                  This is the exact layout guests see on <strong>/hotels/[id]</strong>.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-background rounded-lg border border-border/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewVariant("desktop")}
                    className={cn(
                      "px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors",
                      previewVariant === "desktop"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Monitor className="h-3 w-3" />
                    Desktop Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewVariant("mobile")}
                    className={cn(
                      "px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors",
                      previewVariant === "mobile"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Smartphone className="h-3 w-3" />
                    Mobile Layout
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("arrange")}
                  className="h-7 text-xs gap-1.5"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Rearrange
                </Button>
              </div>
            </div>

            {/* Desktop Preview: 2-Column (Cover on left, 2x2 grid on right) */}
            {previewVariant === "desktop" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 rounded-xl md:rounded-2xl overflow-hidden border border-border/60 bg-muted/20">
                {/* Left Column: Big Featured Cover Photo */}
                <div
                  className="relative aspect-[4/3] md:aspect-auto md:h-[380px] overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => featuredImage && setSelectedImageModal(featuredImage)}
                >
                  {featuredImage ? (
                    <>
                      <img
                        src={featuredImage}
                        alt="Featured hotel view"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Cover Photo (Slot #1)
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2 p-6 text-center">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                      <span>Upload photos to see the live layout</span>
                    </div>
                  )}
                </div>

                {/* Right Column: 2×2 Grid */}
                <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-[280px] md:h-[380px]">
                  {[1, 2, 3, 4].map((slotIdx) => {
                    const img = images[slotIdx];
                    const isLastVisible = slotIdx === 4;
                    const hasMore = remainingCount > 0;

                    return (
                      <div
                        key={slotIdx}
                        className="relative w-full h-full overflow-hidden bg-muted cursor-pointer group"
                        onClick={() => img && setSelectedImageModal(img.url)}
                      >
                        {img ? (
                          <>
                            <img
                              src={img.url}
                              alt={`Hotel view ${slotIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                              Slot #{slotIdx + 1}
                            </div>

                            {/* +X more overlay on 4th grid image if more photos exist */}
                            {isLastVisible && hasMore && (
                              <div className="absolute inset-0 bg-black/60 hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white">
                                <LayoutGrid className="h-5 w-5 mb-1 opacity-90" />
                                <span className="text-sm font-semibold">+{remainingCount} more</span>
                                <span className="text-[10px] text-white/80">View all photos</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-[11px] gap-1 p-2 text-center bg-muted/40">
                            <ImageIcon className="h-4 w-4 opacity-30" />
                            <span>Grid Slot #{slotIdx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Mobile Preview: 16:9 main image on top, 4 thumbs below */
              <div className="max-w-md mx-auto grid grid-cols-1 gap-1.5 rounded-xl overflow-hidden border border-border/60 bg-muted/20 p-2">
                <div
                  className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-muted cursor-pointer"
                  onClick={() => featuredImage && setSelectedImageModal(featuredImage)}
                >
                  {featuredImage ? (
                    <>
                      <img
                        src={featuredImage}
                        alt="Mobile cover view"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        Cover
                      </div>
                      {images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] px-2 py-0.5 rounded-md font-medium">
                          +{images.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No cover photo
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((slotIdx) => {
                    const img = images[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className="relative aspect-video rounded-md overflow-hidden bg-muted cursor-pointer"
                        onClick={() => img && setSelectedImageModal(img.url)}
                      >
                        {img ? (
                          <img
                            src={img.url}
                            alt={`Thumb ${slotIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground/60">
                            #{slotIdx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional gallery images strip (Slots 6+) */}
            {images.length > 5 && (
              <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Full Gallery Drawer ({images.length - 5} additional photos)
                  </span>
                  <span>These appear when guests click &quot;+{remainingCount} more&quot;</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1">
                  {images.slice(5).map((img, extraIdx) => (
                    <div
                      key={extraIdx}
                      onClick={() => setSelectedImageModal(img.url)}
                      className="group relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-border/50 bg-muted cursor-pointer hover:border-primary transition-colors"
                    >
                      <img
                        src={img.url}
                        alt={`Gallery photo ${extraIdx + 6}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-medium">
                        #{extraIdx + 6}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Enlarged Lightbox Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-white z-10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedImageModal}
              alt="Enlarged preview"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
