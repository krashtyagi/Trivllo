"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { amenityIconMap } from "@/components/ui/icons";
import { formatLabel } from "@/components/side-bar-filter/pillGroup";
import { cn } from "@/lib/utils";

type Props = {
  amenities: string[];
  title?: string;
  hotelName?: string;
  className?: string;
};

const AmenitiesValues = ({
  amenities = [],
  title = "Amenities",
  hotelName,
  className,
}: Props) => {
  const pathname = usePathname();

  const previewLimit = 8;
  const previewAmenities = amenities.slice(0, previewLimit);
  const hasMore = amenities.length > previewLimit;

  const formattedTitle = title
    ? title.charAt(0).toUpperCase() + title.slice(1)
    : "";

  if (!amenities || amenities.length === 0) return null;

  const amenitiesHref = `${pathname.replace(/\/$/, "")}/amenities`;

  return (
    <div className={cn("space-y-2", className)}>
      {formattedTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold capitalize dark:text-zinc-400 text-zinc-800">
            {formattedTitle}
          </h3>
        </div>
      )}

      {/* 2-3 lines preview on the page */}
      <div className="flex flex-wrap gap-2 items-center">
        {previewAmenities.map((amenity) => {
          const iconKey = amenity.toLowerCase().replace(/\s+/g, "_");
          const Icon = amenityIconMap[iconKey] || amenityIconMap["breakfast"];

          return (
            <div
              key={amenity}
              className="inline-flex items-center gap-1.5 text-xs dark:bg-muted bg-gray-100 dark:text-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full border border-border/50 cursor-default"
            >
              {Icon && <Icon className="h-3 w-3 text-muted-foreground shrink-0" />}
              <span className="truncate max-w-[140px]">
                {formatLabel(amenity.charAt(0).toUpperCase() + amenity.slice(1))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Link to dedicated /amenities page */}
      <div>
        <Link
          href={amenitiesHref}
          className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-foreground hover:text-primary dark:hover:text-primary underline underline-offset-4 decoration-zinc-400 hover:decoration-primary transition-all cursor-pointer mt-1"
        >
          <span>
            {hasMore ? `Show full (${amenities.length} items)` : "Show full"}
          </span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export { AmenitiesValues, AmenitiesValues as HotelAmenities };
export default AmenitiesValues;