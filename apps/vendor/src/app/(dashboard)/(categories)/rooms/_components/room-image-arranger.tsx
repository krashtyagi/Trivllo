"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  X,
  UploadCloud,
  Loader2,
  Eye,
  ArrowUpDown,
  AlertCircle,
  Maximize2,
  Star,
  ImageIcon,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface RoomImageItem {
  url: string;
  public_id?: string;
  resource_type?: string;
  [key: string]: any;
}

interface RoomImageArrangerProps<T extends RoomImageItem = RoomImageItem> {
  images: T[];
  onChange: (images: T[]) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  uploading?: boolean;
  errorMessage?: string;
}

export function RoomImageArranger<T extends RoomImageItem = RoomImageItem>({
  images,
  onChange,
  onUpload,
  onRemove,
  uploading = false,
  errorMessage,
}: RoomImageArrangerProps<T>) {
  const [activeTab, setActiveTab] = useState<"arrange" | "preview">("arrange");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Reorder helper: moves item from `fromIndex` to `toIndex`
  const moveImageToIndex = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
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

  // Helper label describing where an image lands in the frontend layout
  const getIndexLabel = (index: number) => {
    if (index === 0) return "Cover";
    if (index <= 4) return `Grid ${index}`;
    return `Gallery`;
  };

  const featuredImage = images[0]?.url;
  const gridImages = images.slice(1, 5);
  const remainingCount = Math.max(0, images.length - 5);

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Room Photos
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Drag to reorder. Position 1 is the cover photo, 2–5 fill the grid.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
              <TabsList className="h-8">
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

            <label className="cursor-pointer shrink-0">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors">
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="h-3.5 w-3.5" />
                )}
                Upload
              </span>
            </label>
          </div>
        </div>

        {/* Validation hint */}
        {images.length < 5 && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-muted/60 border border-border/50 text-muted-foreground text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Minimum <strong>5 photos</strong> required ({images.length}/5 uploaded)
            </span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-muted-foreground text-xs space-y-2">
            <UploadCloud className="h-8 w-8 mx-auto opacity-40" />
            <p className="font-medium text-foreground">No photos yet</p>
            <p>Upload high-resolution room photos to get started.</p>
          </div>
        ) : activeTab === "arrange" ? (
          /* ── ARRANGE VIEW ────────────────────────────────────────── */
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((img, index) => {
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;
                const isCover = index === 0;

                return (
                  <div
                    key={`${img.url}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-150 select-none",
                      isCover && "ring-1 ring-foreground/20",
                      isDragging && "opacity-40 scale-95 border-dashed",
                      isDragOver && "ring-2 ring-primary/50 -translate-y-0.5 shadow-md",
                      !isDragging && !isDragOver && "hover:shadow-sm"
                    )}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      <img
                        src={img.url}
                        alt={`Room photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Drag handle overlay */}
                      <div className="absolute top-1.5 left-1.5 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(index);
                        }}
                        title="Remove"
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer z-10 shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {/* Expand button */}
                      <button
                        type="button"
                        onClick={() => setSelectedImageModal(img.url)}
                        title="View full size"
                        className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/60 sm:bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="px-2 py-1.5 flex items-center justify-between border-t border-border/40">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn(
                          "text-[11px] font-medium tabular-nums",
                          isCover ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {isCover && <Star className="h-3 w-3 inline mr-0.5 -mt-0.5" />}
                          {getIndexLabel(index)}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImageToIndex(index, index - 1)}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move left"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <span className="text-[10px] text-muted-foreground tabular-nums min-w-[1.5ch] text-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => moveImageToIndex(index, index + 1)}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move right"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── PREVIEW VIEW ────────────────────────────────────────── */
          <div className="space-y-4">
            <div className="px-3 py-2 bg-muted/40 border border-border/40 rounded-lg flex items-center justify-between text-xs text-muted-foreground">
              <span>
                This is how guests see your photos on the listing page.
              </span>
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

            {/* Layout preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 rounded-xl overflow-hidden border border-border/60 bg-muted/20">
              {/* Left: Cover image */}
              <div className="relative aspect-[4/3] md:aspect-auto md:h-[360px] overflow-hidden bg-muted">
                {featuredImage ? (
                  <>
                    <img
                      src={featuredImage}
                      alt="Cover photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5">
                      <Star className="h-3 w-3" />
                      Cover Photo
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2 p-6 text-center">
                    <ImageIcon className="h-8 w-8 opacity-30" />
                    <span>Cover photo slot</span>
                  </div>
                )}
              </div>

              {/* Right: 2×2 grid */}
              <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-[280px] md:h-[360px]">
                {[1, 2, 3, 4].map((slotIdx) => {
                  const img = images[slotIdx];
                  const isLastVisible = slotIdx === 4;
                  const hasMore = remainingCount > 0;

                  return (
                    <div
                      key={slotIdx}
                      className="relative w-full h-full overflow-hidden bg-muted"
                    >
                      {img ? (
                        <>
                          <img
                            src={img.url}
                            alt={`Room view ${slotIdx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {isLastVisible && hasMore && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                              <LayoutGrid className="h-5 w-5 mb-1 opacity-80" />
                              <span className="text-sm font-semibold">+{remainingCount} more</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-[11px] gap-1 p-2 text-center">
                          <ImageIcon className="h-4 w-4 opacity-30" />
                          <span>Slot {slotIdx + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extra gallery images */}
            {images.length > 5 && (
              <div className="p-3 bg-muted/20 border border-border/40 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Gallery ({images.length - 5} additional)
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.slice(5).map((img, extraIdx) => (
                    <div
                      key={extraIdx}
                      className="relative h-14 w-20 shrink-0 rounded-md overflow-hidden border border-border/40 bg-muted"
                    >
                      <img
                        src={img.url}
                        alt={`Gallery photo ${extraIdx + 6}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                        {extraIdx + 6}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Full image viewer modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-xl overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black text-white z-10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedImageModal}
              alt="Enlarged room view"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
