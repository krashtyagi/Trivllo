"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DescriptionProps = {
  data?: {
    name?: string;
    description: string;
    city?: string;
    address?: string;
  };
  hotelName?: string;
  name?: string;
  description?: string;
  city?: string;
  address?: string;
  className?: string;
};

export function Decription({
  data,
  description: directDesc,
  className,
}: DescriptionProps) {
  const pathname = usePathname();

  const descText = data?.description || directDesc || "";
  const isLong = descText.length > 130;

  if (!descText) return null;

  const descriptionHref = `${pathname.replace(/\/$/, "")}/description`;

  return (
    <div className={cn("space-y-2", className)}>
      {/* 2-3 lines clamped preview */}
      <div className="relative">
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
          {descText}
        </p>

        {isLong && (
          <Link
            href={descriptionHref}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground hover:text-primary dark:hover:text-primary underline underline-offset-4 decoration-zinc-400 hover:decoration-primary transition-all cursor-pointer mt-1.5"
          >
            <span>Show full</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export const HotelDescription = Decription;
export default Decription;
