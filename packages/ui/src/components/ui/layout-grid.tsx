"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { JSX } from "react/jsx-runtime";
import { useIsMobile } from "@/hooks/use-mobile";

type Card = {
  id: number;
  content: JSX.Element | React.ReactNode | string;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);
  const isMobile = useIsMobile();

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full relative">
      {/* --- MOBILE CAROUSEL VIEW --- */}
      {isMobile ? (
        <div className="w-full">
          <div className={cn("flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x snap-mandatory", "md:-mx-20 ")}>
            {cards.map((card, i) => (
              <motion.div
                key={i}
                layoutId={`card-${card.id}`}
                onClick={() => handleClick(card)}
                // Width 90% ensures we see a peek of the next card, aiding visibility
                className="min-w-[90%] h-[400px] snap-center relative rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer"
              >
                <ImageComponent card={card} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                   <div className="text-white text-xs font-medium tracking-widest uppercase opacity-60">Tap to view</div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground/50 mt-2 tracking-widest uppercase">
            ← Swipe to explore →
          </p>
        </div>
      ) : (
        /* --- DESKTOP GRID VIEW --- */
        <div className="w-full h-full md:py-10 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-4">
          {cards.map((card, i) => (
            <div key={i} className={cn(card.className, "h-full w-full min-h-[300px]")}>
              <motion.div
                onClick={() => handleClick(card)}
                layoutId={`card-${card.id}`}
                className={cn(
                  "relative overflow-hidden cursor-pointer bg-neutral-100 rounded-2xl h-full w-full",
                  selected?.id === card.id ? "z-50" : "z-0"
                )}
              >
                <ImageComponent card={card} />
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {/* --- SHARED OVERLAY --- */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleOutsideClick}
              className="fixed inset-0 bg-black/80 z-40 cursor-pointer backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`card-${selected.id}`}
              className={cn(
                "fixed z-50 flex flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl",
                "inset-0 m-auto", 
                "w-[95vw] h-[70vh] md:w-[60vw] md:h-[60vh]" // Increased size for better visibility
              )}
            >
              <SelectedCard selected={selected} />
              {/* Ensure image remains centered in the expanded view */}
              <ImageComponent card={selected} isExpanded />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ImageComponent = ({ card, isExpanded }: { card: Card, isExpanded?: boolean }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      className={cn(
        "absolute inset-0 h-full w-full transition duration-300",
        // PERFECT CENTER: Use object-center instead of object-top
        "object-cover object-center",
        isExpanded ? "scale-100" : "scale-105 hover:scale-100"
      )}
      alt="thumbnail"
    />
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end relative z-[60]">
      {/* Refined gradient: dark at bottom, completely clear by 50% height to keep image visible */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
      
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative px-8 py-10 md:px-12 md:pb-12 z-[70] text-white"
      >
        <div className="max-w-xl">
           {selected?.content}
        </div>
      </motion.div>
    </div>
  );
};