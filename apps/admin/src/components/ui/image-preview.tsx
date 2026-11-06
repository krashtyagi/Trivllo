"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function ImagePreview({
  children,
  src,
  alt,
}: {
  children: React.ReactNode;
  src: string;
  alt?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetZoom();
    }
  };

  // Native non-passive wheel event listener to prevent background scroll while zooming
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom((prev) => {
        const next = Math.min(5, Math.max(1, +(prev + delta).toFixed(2)));
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  // Drag to pan when zoomed
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return;
      e.stopPropagation();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...pan };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom, pan]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  // Double click to toggle zoom
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (zoom > 1) {
        resetZoom();
      } else {
        setZoom(2.5);
      }
    },
    [zoom, resetZoom]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        setZoom((prev) => Math.min(5, +(prev + 0.5).toFixed(2)));
      } else if (e.key === "-") {
        setZoom((prev) => {
          const next = Math.max(1, +(prev - 0.5).toFixed(2));
          if (next <= 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, resetZoom]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="cursor-pointer active:scale-95 transition-transform w-full h-full">
          {children}
        </div>
      </DialogTrigger>

      <DialogContent className="!max-w-[100vw] w-screen h-[100dvh] rounded-none p-0 border-none bg-black/95 shadow-none flex items-center justify-center overflow-hidden z-[100] select-none overscroll-contain">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>

        {/* Floating Top Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          {zoom > 1 && (
            <span className="text-white/60 text-xs font-medium mr-1.5 tabular-nums select-none">
              {Math.round(zoom * 100)}%
            </span>
          )}

          <button
            type="button"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setZoom((prev) => Math.min(5, +(prev + 0.5).toFixed(2)))}
            title="Zoom In (+)"
          >
            <ZoomIn size={18} />
          </button>

          <button
            type="button"
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() =>
              setZoom((prev) => {
                const next = Math.max(1, +(prev - 0.5).toFixed(2));
                if (next <= 1) setPan({ x: 0, y: 0 });
                return next;
              })
            }
            title="Zoom Out (-)"
          >
            <ZoomOut size={18} />
          </button>

          {zoom > 1 && (
            <button
              type="button"
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={resetZoom}
              title="Reset Zoom (0)"
            >
              <RotateCcw size={18} />
            </button>
          )}

          <div className="w-[1px] h-4 bg-white/20 mx-1" />

          <DialogPrimitive.Close className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        {/* Full Viewport Container */}
        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center p-4 md:p-10 overflow-hidden cursor-default"
          style={{ touchAction: "none" }}
          onClick={() => {
            if (zoom > 1) resetZoom();
          }}
        >
          <img
            src={src}
            alt={alt || "Preview"}
            draggable={false}
            className="max-w-full max-h-[90dvh] object-contain select-none animate-in zoom-in-95 duration-200"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Bottom Zoom Hint */}
          {zoom <= 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs flex items-center gap-1.5 select-none pointer-events-none bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
              <ZoomIn size={13} /> Scroll or double-click to zoom
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}