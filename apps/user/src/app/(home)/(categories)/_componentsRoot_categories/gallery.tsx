import { cn } from "@/lib/utils";
import { optimizeCloudinaryUrl, IMAGE_PRESETS } from "@/lib/image-optimizer";

type GalleryImage = {
  src: string;
  alt: string;
};

type GallerySection = {
  type?: string;
  images: GalleryImage[];
};

type GalleryVariant = "default" | "base4";
const Gallery = ({
  sections,
  variant = "default",
}: {
  sections: GallerySection[];
  variant?: GalleryVariant;
}) => {
  const totalImagesCount = sections.flatMap((s) => s.images).length;

  return (
    <DrawerDemo
      sections={sections}
      content={
        variant === "base4" ? (
          <div className="grid grid-cols-1 gap-1 md:gap-2 rounded-xl md:rounded-2xl overflow-hidden w-full cursor-pointer">
            {/* Main Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
              <img
                src={optimizeCloudinaryUrl(
                  sections?.[0]?.images?.[0]?.src,
                  IMAGE_PRESETS.detailGalleryMain,
                )}
                alt={sections?.[0]?.images?.[0]?.alt || "Featured view"}
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* dynamic overlay count */}
              {totalImagesCount > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  +{totalImagesCount - 1} more
                </div>
              )}
            </div>

            {/* Bottom Images */}
            <div className="grid grid-cols-4 gap-1 md:gap-2">
              {sections
                .flatMap((s) => s.images)
                .slice(1, 5)
                .map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video overflow-hidden rounded-md bg-muted"
                  >
                    <img
                      src={optimizeCloudinaryUrl(
                        image.src,
                        IMAGE_PRESETS.detailGalleryThumb,
                      )}
                      alt={image.alt || `View ${index + 2}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:gap-1 gap-0.5 rounded-xl md:rounded-2xl cursor-pointer overflow-hidden w-full aspect-[4/3] md:aspect-auto xl:h-[430px] md:h-[300px] bg-muted">
            {sections.slice(0, 2).map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className={cn(
                  "h-full w-full",
                  section.type === "grid"
                    ? "grid grid-cols-2 grid-rows-2 gap-0.5 md:gap-1"
                    : "block",
                )}
              >
                {section.images.map((image, imageIndex) => {
                  const isMain = sectionIndex === 0 && imageIndex === 0;
                  const isLastVisibleImage =
                    sectionIndex === 1 && imageIndex === 3;
                  const hasMore = totalImagesCount > 5;
                  const optimizedSrc = optimizeCloudinaryUrl(
                    image.src,
                    isMain
                      ? IMAGE_PRESETS.detailGalleryMain
                      : IMAGE_PRESETS.detailGalleryThumb,
                  );

                  return (
                    <div
                      key={imageIndex}
                      className="relative w-full h-full overflow-hidden bg-muted"
                    >
                      <img
                        src={optimizedSrc}
                        alt={image.alt || "Property photo"}
                        loading={isMain ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover hover:grayscale-60 transition-opacity"
                      />
                      {isLastVisibleImage && hasMore && (
                        <div className="absolute inset-0 bg-black/55 hover:bg-black/45 transition-colors flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                          <Grid3X3 className="h-5 w-5 mb-1" />
                          <span className="text-xs font-semibold">
                            +{totalImagesCount - 5} more
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )
      }
    />
  );
};

export default Gallery;

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Grid3X3, Minus, Plus } from "lucide-react";

export function DrawerDemo({
  content,
  sections,
}: {
  content: React.ReactNode;
  sections: GallerySection[];
}) {
  const [goal, setGoal] = React.useState(350);

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)));
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{content}</DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[95vh] rounded-4xl ">
        <DrawerHeader>
          <DrawerTitle>Image Gallery</DrawerTitle> {/* ← Add this */}
          {/* Optional: */}
          <DrawerDescription>View all photos of the property</DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto w-full  overflow-y-scroll flex flex-col gap-1 md:gap-2 p-2">
          <InnerGallery sections={sections} />
          {/* <InnerGallery sections={sections} /> */}
        </div>
        <div className="h-30 w-full"></div>
      </DrawerContent>
    </Drawer>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

const InnerGallery = ({ sections }: { sections: GallerySection[] }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const allImages = sections.flatMap((section) => section.images);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const showNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedIndex !== null) {
        setSelectedIndex((selectedIndex + 1) % allImages.length);
        resetZoom();
      }
    },
    [selectedIndex, allImages.length, resetZoom],
  );

  const showPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (selectedIndex !== null) {
        setSelectedIndex(
          (selectedIndex - 1 + allImages.length) % allImages.length,
        );
        resetZoom();
      }
    },
    [selectedIndex, allImages.length, resetZoom],
  );

  const overlayRef = useRef<HTMLDivElement>(null);

  // Non-passive wheel event listener: prevents background screen & drawer scrolling while zooming
  useEffect(() => {
    if (selectedIndex === null) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom((prev) => {
        const next = Math.min(5, Math.max(1, +(prev + delta).toFixed(2)));
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    };

    overlay.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      overlay.removeEventListener("wheel", handleWheelNative);
    };
  }, [selectedIndex]);

  // Drag-to-pan when zoomed
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return;
      e.stopPropagation();
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom, pan],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
    },
    [isDragging],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (zoom > 1) {
        resetZoom();
      } else {
        setZoom(2.5);
      }
    },
    [zoom, resetZoom],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") {
        if (zoom > 1) {
          resetZoom();
        } else {
          setSelectedIndex(null);
        }
      }
      if (e.key === "+" || e.key === "=")
        setZoom((prev) => Math.min(5, prev + 0.25));
      if (e.key === "-")
        setZoom((prev) => {
          const n = Math.max(1, prev - 0.25);
          if (n <= 1) setPan({ x: 0, y: 0 });
          return n;
        });
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev, zoom, resetZoom]);

  // Prevent body scroll when fullscreen overlay is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [selectedIndex]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2 w-full">
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={cn(
              "w-full h-full",
              section.type === "grid"
                ? "grid grid-cols-2 gap-1 md:gap-2"
                : "block",
            )}
          >
            {section.images.map((image, imageIndex) => {
              const globalIndex = allImages.indexOf(image);
              return (
                <div
                  key={imageIndex}
                  className="relative overflow-hidden rounded-lg bg-muted cursor-pointer group"
                  onClick={() => setSelectedIndex(globalIndex)}
                >
                  <img
                    src={optimizeCloudinaryUrl(
                      image.src.length > 50
                        ? image.src
                        : "/hotels/roomIdeal.png",
                      IMAGE_PRESETS.detailDrawerThumb,
                    )}
                    alt={image.alt || "Property view"}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                      section.type === "grid" ? "aspect-video" : "aspect-auto",
                    )}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] bg-black/95 animate-in fade-in duration-200 select-none overscroll-contain touch-none"
          onClick={() => {
            if (zoom > 1) resetZoom();
            else setSelectedIndex(null);
          }}
          style={{ touchAction: "none" }}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-[120] flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
            <span className="text-white/80 text-sm font-medium tabular-nums">
              {selectedIndex + 1} / {allImages.length}
            </span>
            <div className="flex items-center gap-1">
              {zoom > 1 && (
                <span className="text-white/50 text-xs mr-2 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
              )}
              <button
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((prev) => Math.min(5, prev + 0.5));
                }}
                title="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <button
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((prev) => {
                    const n = Math.max(1, prev - 0.5);
                    if (n <= 1) setPan({ x: 0, y: 0 });
                    return n;
                  });
                }}
                title="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              {zoom > 1 && (
                <button
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetZoom();
                  }}
                  title="Reset zoom"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              <button
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(null);
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
            onClick={(e) => {
              e.stopPropagation();
              showPrev(e);
            }}
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
          </button>

          <button
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
            onClick={(e) => {
              e.stopPropagation();
              showNext(e);
            }}
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
          </button>

          {/* Image container - full viewport */}
          <div
            ref={imgContainerRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden pt-12 pb-4 px-10 md:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={optimizeCloudinaryUrl(
                allImages[selectedIndex].src.length > 50
                  ? allImages[selectedIndex].src
                  : "/hotels/roomIdeal.png",
                IMAGE_PRESETS.detailZoomHighRes,
              )}
              alt={allImages[selectedIndex].alt || "Photo zoom"}
              draggable={false}
              decoding="async"
              className="select-none animate-in zoom-in-95 fade-in duration-200"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                cursor:
                  zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={handleDoubleClick}
            />
          </div>

          {/* Bottom hint */}
          {zoom <= 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[110] text-white/30 text-xs flex items-center gap-1.5 select-none pointer-events-none">
              <ZoomIn size={12} /> Scroll or double-click to zoom
            </div>
          )}
        </div>
      )}
    </>
  );
};
