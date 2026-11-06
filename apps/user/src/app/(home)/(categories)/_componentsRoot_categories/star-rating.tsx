import React from "react";
import { IconStarFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  className?: string;
  maxStars?: number;
}

export const StarRating = ({
  rating,
  className = "h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5",
  maxStars = 5,
}: StarRatingProps) => {
  const roundedRating = Math.round(rating);
  return (
    <>
      {[...Array(maxStars)].map((_, i) => (
        <IconStarFilled
          key={i}
          className={cn(
            i < roundedRating ? "text-yellow-400" : "text-zinc-200/70",
            className
          )}
        />
      ))}
    </>
  );
};
