"use client";

import { IconSearch } from "@tabler/icons-react";
import type { FilterBarValues } from "@/constants/constants";
import { cn } from "@/lib/utils";
import { Item, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";
import { RouterPush } from "../RouterPush";
import { useHotelStore } from "@/store/hotel.store";
import { useToursStore } from "@/store/tours.store";

export const PagesFilterBarButtons = ({
  PagesFilterBarValues,
  link,
  type,
  category
}: {
  PagesFilterBarValues: (FilterBarValues & { element?: React.ReactNode })[];
  link?: string;
  type?: "filter" | "home";
  category?: "hotels" | "bikes" | "cabs" | "tours" | "adventures";
}) => {
  const navigate = useRouter();
  const hotelStore = useHotelStore();
  const toursStore = useToursStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative  ">
      <AnimatePresence>
        {selectedId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 "
            onClick={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-30 flex items-center bg-transparent rounded-full gap-0.5 sm:gap-1">
        {PagesFilterBarValues.map((hv, i) => {
          const isActive = selectedId === i;
          return (
            <div
              key={i}
              className="relative "
              onMouseEnter={() => selectedId !== null && setSelectedId(i)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(i);
              }}
            >
              <Item
                className={cn(
                  "relative z-40 cursor-pointer rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all duration-300",
                  isActive ? "text-emerald-800 dark:text-emerald-400 font-bold" : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-highlight"
                    className="absolute inset-0 z-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <ItemContent className="relative z-20 items-center gap-0 md:text-left">
                  <ItemTitle className="text-xs sm:text-xs md:text-sm font-bold uppercase tracking-wider justify-start">
                    {hv.value}
                  </ItemTitle>
                  <div className="flex justify-center  w-full ">

                  </div>
                </ItemContent>
              </Item>
            </div>
          );
        })}

        {type === "home" && (
          <Button
            onClick={() => {
              const currentCity = category === "tours" ? toursStore.city : hotelStore.city;
              const targetPath = link || `/${category || "hotels"}/find`;
              const finalUrl = currentCity?.trim()
                ? `${targetPath}?city=${encodeURIComponent(currentCity.trim().toLowerCase())}`
                : targetPath;
              RouterPush(navigate, finalUrl);
            }}
            className="z-40 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#0c3926] hover:bg-[#072619] text-white shadow-md hover:scale-105 transition-transform ml-1 sm:ml-2 flex items-center justify-center shrink-0 cursor-pointer p-0"
          >
            <IconSearch size={18} stroke={2.5} />
          </Button>
        )}
      </div>

      {/* 3. The Large Dynamic Drawer (POSITIONING CHANGED) */}
      {/* 3. The Large Dynamic Drawer */}
      <AnimatePresence>
        {selectedId !== null && (
          <motion.div
            layout // Essential for smooth transition between items
            key="drawer" // Keep the drawer as one consistent layout element
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              layout: { type: "spring", bounce: 0.1, duration: 0.3 },
              opacity: { duration: 0.2 }
            }}
            style={{ originX: 0.5 }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 z-50 md:w-[95vw] w-[90vw] min-h-[100px] max-w-xl md:rounded-2xl rounded-xl border border-border bg-background md:p-2 shadow-2xl",
              "top-full mt-3"
            )}
          >
            <motion.div layout className="p-7">
              <AnimatePresence mode="popLayout" initial={false}>
                {/* We use a internal key for content, but keep the parent drawer stable */}
                <motion.div
                  key={selectedId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-full py-3">
                    {PagesFilterBarValues[selectedId].element}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

