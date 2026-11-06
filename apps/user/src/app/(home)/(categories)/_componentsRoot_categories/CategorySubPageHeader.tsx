"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CategorySubPageHeaderProps = {
  entityName?: string;
  categoryName?: string;
  currentPageTitle: string; // e.g. "Amenities" | "Description"
  backUrl: string;
  maxWidthClass?: string;
};

export function CategorySubPageHeader({
  entityName,
  categoryName = "hotels",
  currentPageTitle,
  backUrl,
  maxWidthClass = "max-w-6xl",
}: CategorySubPageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backUrl);
    }
  };

  const isTour = categoryName.includes("tour");
  const categoryLabel = isTour ? "Tours" : "Hotels";
  const categoryHref = isTour ? "/tours" : "/hotels";

  return (
    <div className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div
        className={`mx-auto flex h-14 ${maxWidthClass} items-center justify-between px-4 sm:px-6`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={categoryHref}
              className="hover:text-foreground transition-colors"
            >
              {categoryLabel}
            </Link>
            {entityName && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link
                  href={backUrl}
                  className="capitalize truncate max-w-[150px] hover:text-foreground transition-colors"
                >
                  {entityName.charAt(0).toUpperCase() + entityName.slice(1)}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">
              {currentPageTitle}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="rounded-xl text-xs font-semibold h-8 cursor-pointer"
        >
          Back to {isTour ? "Tour" : "Hotel"}
        </Button>
      </div>
    </div>
  );
}
