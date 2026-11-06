"use client"

import React, { useLayoutEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Item, OnlyCarousel } from "./onlyColursel"
import { destinations } from "@/constants/constants"
import { useHotelsQuery } from "@/services/hotel/querys"
import { MapPin } from "lucide-react";

type TabItem = {
  name: string
}

export type CarouselProps = {
  name?: string
  tagline: string
  city?: string
  tabs?: TabItem[]
  type: "cabs" | "adventures" | "tours" | "bikes" | "hotels"
  items: Item[]
  isLoading?: boolean
  icon?: React.ReactNode
  galleryCardHide?: boolean;
}

export function PopularDestinationCarousel({
  tagline,
  city,
  tabs,
  type,
  items,
  isLoading,
  icon = <MapPin className="h-3 w-3 shrink-0" />,
  galleryCardHide = false
}: CarouselProps) {
  const [active, setActive] = useState(tabs?.[0]?.name ?? "")
  const [activeIndex, setActiveIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0 })


  useLayoutEffect(() => {
    const el = tabRefs.current[activeIndex]
    const parent = containerRef.current
    if (!el || !parent) return

    const elRect = el.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    setPill({
      left: elRect.left - parentRect.left,
      width: elRect.width,
    })
  }, [activeIndex])

  if (!tabs) {
    return (
      <OnlyCarousel type={type} tagline={tagline} city={city} items={items} isLoading={isLoading} icon={icon} galleryCardHide={galleryCardHide} />
    )
  }

  return (
    <div className="w-full max-w-screen">
      <h2 className="mb-3 text-lg font-semibold px-3">Trending {active}</h2>

      {/* MASKING WRAPPER (key fix) */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={containerRef}
          className={cn(
            "relative flex items-center gap-2",
            "overflow-x-auto no-scrollbar",
            "sm:rounded-full px-1 py-1",
            "bg-white dark:bg-zinc-900",
            "border border-black/5 dark:border-white/10",
            "w-max max-w-full" // ⬅ important
          )}
        >
          {/* Animated pill */}
          <motion.div
            transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
            className="absolute top-1 bottom-1 md:rounded-full md:bg-pink-100 md:dark:bg-zinc-800"
            style={{
              left: pill.left,
              width: pill.width,
            }}
          />

          {tabs.map((tab, i) => (
            <button
              key={tab.name}
              ref={(el) => { tabRefs.current[i] = el }}
              onClick={() => {
                setActive(tab.name)
                setActiveIndex(i)
              }}
              className={cn(
                "relative z-10 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap",
                active === tab.name
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-2 min-h-[190px] sm:min-h-[260px]">
        <OnlyCarousel key={active} type={type} items={items} isLoading={isLoading} icon={icon} galleryCardHide={galleryCardHide} />
      </div>
    </div>
  )
}
