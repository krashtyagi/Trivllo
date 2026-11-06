"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";

type TransitionEffect = "zoom-rotate" | "slide-blur" | "morph" | "cinematic-pan";

const TRANSITION_EFFECTS: TransitionEffect[] = [
  "zoom-rotate",
  "slide-blur",
  "morph",
  "cinematic-pan",
];

function getVariants(effect: TransitionEffect) {
  switch (effect) {
    case "zoom-rotate":
      return {
        initial: { scale: 1.3, opacity: 0, rotate: 2, filter: "blur(12px)" },
        animate: {
          scale: 1,
          opacity: 1,
          rotate: 0,
          filter: "blur(0px)",
          transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
        },
        exit: {
          scale: 1.15,
          opacity: 0,
          rotate: -1,
          filter: "blur(8px)",
          transition: { duration: 0.8, ease: [0.55, 0, 1, 0.45] as const },
        },
      };
    case "slide-blur":
      return {
        initial: { x: "8%", opacity: 0, filter: "blur(20px)", scale: 1.05 },
        animate: {
          x: "0%",
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
        },
        exit: {
          x: "-8%",
          opacity: 0,
          filter: "blur(20px)",
          scale: 1.05,
          transition: { duration: 0.8, ease: [0.55, 0, 1, 0.45] as const },
        },
      };
    case "morph":
      return {
        initial: { scale: 0.92, opacity: 0, borderRadius: "30%", filter: "blur(16px) saturate(0.3)" },
        animate: {
          scale: 1,
          opacity: 1,
          borderRadius: "0%",
          filter: "blur(0px) saturate(1)",
          transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] as const },
        },
        exit: {
          scale: 1.08,
          opacity: 0,
          borderRadius: "10%",
          filter: "blur(12px) saturate(0.5)",
          transition: { duration: 0.7, ease: [0.55, 0, 1, 0.45] as const },
        },
      };
    case "cinematic-pan":
      return {
        initial: { scale: 1.25, opacity: 0, y: "5%", filter: "blur(6px) brightness(1.3)" },
        animate: {
          scale: 1.05,
          opacity: 1,
          y: "0%",
          filter: "blur(0px) brightness(1)",
          transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
        },
        exit: {
          scale: 1,
          opacity: 0,
          y: "-3%",
          filter: "blur(4px) brightness(0.8)",
          transition: { duration: 0.9, ease: [0.55, 0, 1, 0.45] as const },
        },
      };
  }
}

// Subtle Ken Burns drift during display
const kenBurnsVariants = {
  animate: {
    scale: [1, 1.06, 1.03],
    x: ["0%", "1%", "-0.5%"],
    y: ["0%", "-1%", "0.5%"],
    transition: {
      duration: 8,
      ease: "easeInOut" as const,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

export const ImagesSlider = ({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  interval = 5000,
}: {
  images: string[];
  children: React.ReactNode;
  overlay?: React.ReactNode;
  overlayClassName?: string;
  className?: string;
  autoplay?: boolean;
  interval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [effectIndex, setEffectIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setEffectIndex((prev) => (prev + 1) % TRANSITION_EFFECTS.length);
    setProgress(0);
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? images.length - 1 : prev - 1));
    setEffectIndex((prev) => (prev + 1) % TRANSITION_EFFECTS.length);
    setProgress(0);
  }, [images.length]);

  // Preload images
  useEffect(() => {
    const loadPromises = images.map(
      (image) =>
        new Promise<string | null>((resolve) => {
          const img = new Image();
          img.src = image;
          img.onload = () => resolve(image);
          img.onerror = () => {
            console.warn(`Failed to load image: ${image}`);
            resolve(null);
          };
        })
    );
    Promise.all(loadPromises)
      .then((results) => {
        const loaded = results.filter((img): img is string => img !== null);
        if (loaded.length > 0) {
          setLoadedImages(loaded);
        } else {
          console.error("Failed to load any images from standard list", images);
        }
      });
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrevious();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);

  // Autoplay + progress bar
  useEffect(() => {
    if (!autoplay || loadedImages.length === 0) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (interval / 50);
      });
    }, 50);

    const slideTimer = setInterval(() => {
      handleNext();
    }, interval);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideTimer);
    };
  }, [autoplay, interval, handleNext, loadedImages.length, currentIndex]);

  const areImagesLoaded = loadedImages.length > 0;
  const currentEffect = TRANSITION_EFFECTS[effectIndex];
  const variants = getVariants(currentEffect);

  return (
    <div
      className={cn(
        "overflow-hidden h-full w-full relative flex items-center justify-center group",
        className
      )}
    >
      {/* Background images with transitions */}
      {areImagesLoaded && (
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
          >
            <motion.img
              src={loadedImages[currentIndex]}
              className="h-full w-full object-cover object-center"
              variants={kenBurnsVariants}
              animate="animate"
              alt=""
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Loader layout skeleton when images are loading */}
      {!areImagesLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/90 dark:bg-zinc-950/90 px-6 text-center animate-pulse z-40 transition-all duration-300">
          {/* Title Placeholder */}
          <div className="h-8 sm:h-12 w-[60%] max-w-md bg-white/20 rounded-xl mb-4" />
          
          {/* Line Separator Placeholder */}
          <div className="h-[2px] w-32 md:w-48 bg-white/15 my-4" />
          
          {/* Description Placeholder */}
          <div className="h-4 sm:h-5 w-[80%] max-w-md bg-white/15 rounded-lg mb-2" />
          <div className="h-4 sm:h-5 w-[50%] max-w-xs bg-white/15 rounded-lg mb-8" />
          
          {/* CTA Button Placeholder */}
          <div className="h-10 sm:h-12 w-32 sm:w-40 bg-white/20 rounded-full" />
        </div>
      )}

      {/* Multi-layer overlay for depth */}
      {areImagesLoaded && overlay && (
        <>
          <div
            className={cn(
              "absolute inset-0 z-30",
              "bg-gradient-to-t from-black/80 via-black/30 to-black/10",
              overlayClassName
            )}
          />
          <div className="absolute inset-0 z-30 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 z-30" style={{
            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)"
          }} />
        </>
      )}

      {/* Content */}
      {areImagesLoaded && (
        <div className="relative z-50 w-full h-full flex items-center justify-center">
          {children}
        </div>
      )}

      {/* Bottom progress indicators */}
      {areImagesLoaded && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setEffectIndex((prev) => (prev + 1) % TRANSITION_EFFECTS.length);
                setProgress(0);
              }}
              className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === currentIndex ? 32 : 16 }}
            >
              <div className="absolute inset-0 bg-white/25 rounded-full" />
              {i === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Decorative light streak */}
      <div className="absolute top-0 left-0 right-0 h-px z-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px z-40 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};
