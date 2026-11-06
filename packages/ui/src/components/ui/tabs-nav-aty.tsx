
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Pages } from "@/constants/constants";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RouterPush } from "../RouterPush";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Building2, Palmtree } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export const TabsNav = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  className,
  tabClassName,
}: {
  mobile: boolean;
  tabs: Pages[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  className?: string;
}) => {
  const navigate = useRouter();
  const location = usePathname();
  const ismobile = useIsMobile();
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(true);
  const active = propTabs.find(
    (tab) =>
      location.endsWith(tab.link) ||
      (tab.link === "/hotels" && (location === "/" || location === ""))
  );

  // Scroll arrow state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -670 : 670, behavior: "smooth" });
  };

  if (ismobile) {
    return (
      <div className="w-full flex items-center justify-center gap-8 sm:gap-10 py-1 px-4 bg-transparent">
        {propTabs.map((tab) => {
          const isTabActive =
            active?.title === tab.title ||
            location.endsWith(tab.link) ||
            (tab.link === "/hotels" && (location === "/" || location === ""));
          const isHotel = tab.title.toLowerCase().includes("hotel");
          const iconSrc = isHotel
            ? "/nav-icons/hotel-logo.png"
            : "/nav-icons/tours-logo.png";

          return (
            <Link
              key={tab.title}
              href={tab.link}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1 transition-all select-none cursor-pointer",
                isTabActive
                  ? "text-[#0c3926] dark:text-emerald-400 font-bold"
                  : "text-gray-600 dark:text-zinc-400 font-medium hover:text-foreground"
              )}
            >
              <div className="w-8 h-8 relative shrink-0">
                <Image
                  src={iconSrc}
                  alt={tab.title}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-bold">{tab.title}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ y: isVisible ? 0 : -100 }}
      className={cn(
        "z-10 w-full flex justify-center",
        className
      )}
    >
      {/* Wrapper for arrows + scrollable container */}
      <div className={cn("relative flex items-center justify-center")}>
        <div
          ref={scrollRef}
          className={cn(
            "flex items-center gap-1 sm:gap-2",
            "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-full px-3 py-1.5",
            "border border-black/5 dark:border-white/10 shadow-sm",
            containerClassName,
          )}
        >
          {propTabs.map((tab, index) => {
            const isTabActive =
              active?.title === tab.title ||
              location.endsWith(tab.link) ||
              (tab.link === "/hotels" && (location === "/" || location === ""));
            const isHotel = tab.title.toLowerCase().includes("hotel");
            const isTour = tab.title.toLowerCase().includes("tour");

            return (
              <React.Fragment key={tab.title}>
                <Link
                  href={tab.link}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full transition-all text-xs sm:text-sm font-semibold select-none",
                    isTabActive
                      ? "text-emerald-800 dark:text-emerald-400 font-bold"
                      : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white",
                    tabClassName
                  )}
                >
                  {isHotel && (
                    <Building2
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isTabActive
                          ? "text-emerald-800 dark:text-emerald-400"
                          : "text-gray-500"
                      )}
                    />
                  )}
                  {isTour && (
                    <Palmtree
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isTabActive
                          ? "text-emerald-800 dark:text-emerald-400"
                          : "text-gray-500"
                      )}
                    />
                  )}
                  {!isHotel && !isTour && tab.iconUrl && (
                    <Image
                      src={tab.iconUrl}
                      alt={tab.title}
                      width={18}
                      height={18}
                      className="rounded-full object-cover shrink-0"
                    />
                  )}
                  <span>{tab.title}</span>

                  {/* Active bottom underline indicator */}
                  {isTabActive && (
                    <motion.div
                      layoutId="active-nav-tab-underline"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-800 dark:bg-emerald-400 rounded-full"
                    />
                  )}
                </Link>

                {/* Divider between tabs */}
                {index < propTabs.length - 1 && (
                  <span className="text-gray-300 dark:text-zinc-700 font-light select-none px-1">
                    |
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right arrow + fade — mobile only */}
        <AnimatePresence>
          {ismobile && canScrollRight && (
            <motion.div
              key="scroll-right-zone"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 z-30 flex items-center justify-end h-full"
              style={{ pointerEvents: "none" }}
            >
              {/* Gradient fade mask */}
              <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background via-background/60 to-transparent pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); scroll("right"); }}
                className="relative z-10 flex items-center justify-center w-8 h-14 rounded-tl-xl rounded-bl-xl bg-background/90 dark:bg-zinc-800/90 backdrop-blur-md border border-border/50 shadow-lg active:scale-90 transition-transform"
                style={{ pointerEvents: "auto" }}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-foreground/80" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};











// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import type { Pages } from "@/constants/constants";
// import { usePathname, useRouter } from "next/navigation";
// import { useIsMobile } from "@/hooks/use-mobile";
// import { useCallback, useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// export const TabsNav = ({
//   tabs: propTabs,
//   containerClassName,
//   activeTabClassName,
//   className,
//   tabClassName,
// }: {
//   mobile: boolean;
//   tabs: Pages[];
//   containerClassName?: string;
//   activeTabClassName?: string;
//   tabClassName?: string;
//   className?: string;
// }) => {
//   const location = usePathname();
//   const ismobile = useIsMobile();
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

//   const [isVisible, setIsVisible] = useState(true);
//   const imgsize = ismobile ? 28 : 34;
//   const active = propTabs.find((tab) => location.endsWith(tab.link));

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [canScrollLeft, setCanScrollLeft] = useState(false);
//   const [canScrollRight, setCanScrollRight] = useState(false);

//   const checkScroll = useCallback(() => {
//     const el = scrollRef.current;
//     if (!el) return;
//     setCanScrollLeft(el.scrollLeft > 2);
//     setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
//   }, []);

//   useEffect(() => {
//     const el = scrollRef.current;
//     if (!el) return;
//     checkScroll();
//     el.addEventListener("scroll", checkScroll, { passive: true });
//     window.addEventListener("resize", checkScroll);
//     return () => {
//       el.removeEventListener("scroll", checkScroll);
//       window.removeEventListener("resize", checkScroll);
//     };
//   }, [checkScroll]);

//   const scroll = (direction: "left" | "right") => {
//     const el = scrollRef.current;
//     if (!el) return;
//     el.scrollBy({ left: direction === "left" ? -670 : 670, behavior: "smooth" });
//   };

//   return (
//     <motion.div
//       initial={false}
//       animate={{ y: isVisible ? 0 : -100 }}
//       className={cn(
//         "z-10 w-full flex justify-center",
//         ismobile ? "z-50 pb-0" : "",
//         className
//       )}
//     >
//       <div className="relative w-full flex items-center">
//         {/* Scroll Arrows Logic (Omitted for brevity, keep your original code here) */}

//         <div
//           ref={scrollRef}
//           className={cn(
//             "flex items-center w-full mx-auto",
//             "bg-white dark:bg-zinc-900 rounded-[14px] p-1.5",
//             "border border-black/5 dark:border-white/10 shadow-sm md:min-w-[410px] lg:min-w-[710px] xl:min-w-[910px] overflow-x-auto",
//             containerClassName,
//             ismobile ? "border-none shadow-none scrollbar-hide" : ""
//           )}
//         >
//           {propTabs.map((tab, index) => (
//             <div
//               key={tab.title}
//               className="flex flex-1 items-center min-w-19 min-h-16"
//               onMouseEnter={() => setHoveredIndex(index)}
//               onMouseLeave={() => setHoveredIndex(null)}
//             >
//               <Link
//                 href={tab.link}
//                 className={cn(
//                   "relative flex-1 flex items-center justify-center px-2 sm:px-4 py-2 rounded-[12px]",
//                   "md:text-base text-sm font-medium transition-all whitespace-nowrap",
//                   "hover:bg-pink-50 dark:hover:bg-zinc-800 border-none",
//                   tabClassName
//                 )}
//               >
//                 {/* Jelly Tooltip */}
//                 <AnimatePresence>
//                   {hoveredIndex === index && !ismobile && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10, scale: 0.5 }}
//                       animate={{ opacity: 1, y: -45, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.5 }}
//                       transition={{
//                         type: "spring",
//                         stiffness: 300, // High stiffness for jelly snap
//                         damping: 15,    // Lower damping for the "jiggle"
//                         mass: 0.8
//                       }}
//                       className="absolute z-50 px-3 py-1 text-xs font-bold text-white bg-zinc-900 dark:bg-pink-500 rounded-full shadow-xl pointer-events-none whitespace-nowrap"
//                     >
//                       {tab.title}
//                       {/* Triangle Arrow */}
//                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-pink-500 rotate-45" />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {active?.title === tab.title && (
//                   <motion.div
//                     layoutId="active-nav-tab"
//                     transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
//                     className={cn(
//                       "absolute inset-0 rounded-[12px] bg-pink-100 dark:bg-zinc-800",
//                       activeTabClassName
//                     )}
//                   />
//                 )}

//                 <span className="relative z-20 flex gap-2 md:gap-3 items-center">
//                   {tab.iconUrl && (
//                     <div className="shrink-0">
//                       <Image
//                         className={cn(
//                           "rounded-full object-cover transition-transform duration-300 scale-145",
//                           tab.iconUrl === active?.iconUrl && "scale-100"
//                         )}
//                         src={tab.iconUrl}
//                         alt={tab.title}
//                         width={imgsize}
//                         height={imgsize}
//                         priority
//                       />
//                     </div>
//                   )}
//                   {/* Keep text hidden or visible based on your design; the tooltip covers it on hover */}
//                   <span className="hidden xl:block text-xs sm:text-sm">
//                     {tab.title}
//                   </span>
//                 </span>
//               </Link>

//               {index < propTabs.length - 1 && !ismobile && (
//                 <div className="h-5 w-px bg-black/10 dark:bg-white/10 mx-1 opacity-30" />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Right arrow logic (Omitted for brevity, keep original) */}
//       </div>
//     </motion.div>
//   );
// };