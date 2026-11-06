"use client";

import React from "react";
import {
  MapPin,
  Building2,
  Compass,
  ShieldCheck,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategorySubPageHeader } from "./CategorySubPageHeader";
import { CategorySubPageBottomCta } from "./CategorySubPageBottomCta";

type FullDescriptionViewProps = {
  name: string;
  description: string;
  city?: string;
  address?: string;
  categoryName?: "hotels" | "tours" | "tours/services" | string;
  backUrl: string;
};

export default function FullDescriptionView({
  name,
  description = "",
  city,
  address,
  categoryName = "hotels",
  backUrl,
}: FullDescriptionViewProps) {
  const isTour = categoryName.includes("tour");

  // Clean split into readable paragraphs
  const paragraphs = description
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Shared Header & Breadcrumbs */}
      <CategorySubPageHeader
        entityName={name}
        categoryName={categoryName}
        currentPageTitle="Description"
        backUrl={backUrl}
        maxWidthClass="max-w-4xl"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* Header Hero Banner */}
        <div className="space-y-4 border-b border-border/60 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {isTour ? (
              <Compass className="h-3.5 w-3.5" />
            ) : (
              <Building2 className="h-3.5 w-3.5" />
            )}
            {isTour ? "Tour Overview" : "About This Place"}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground capitalize">
            {name}
          </h1>

          {(city || address) && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{address || city}</span>
            </div>
          )}

          {/* Quick Stats / Highlights */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Verified & Authentic
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground">
              <CalendarCheck className="h-3.5 w-3.5 text-primary" />
              Instant Confirmation
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Curated Experience
            </span>
          </div>
        </div>

        {/* Formatted Full Description Content */}
        <div className="space-y-5 rounded-3xl border border-border/80 bg-card/40 p-6 sm:p-10 shadow-xs">
          {paragraphs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No detailed description provided for this listing yet.
            </p>
          ) : (
            paragraphs.map((para, idx) => (
              <p
                key={idx}
                className={cn(
                  "leading-relaxed text-zinc-700 dark:text-zinc-300",
                  idx === 0
                    ? "text-base sm:text-lg font-medium text-foreground/90 border-l-2 border-primary pl-4"
                    : "text-sm sm:text-base"
                )}
              >
                {para}
              </p>
            ))
          )}
        </div>

        {/* Shared Bottom Navigation CTA */}
        <CategorySubPageBottomCta
          title="Ready to view options?"
          subtitle="Return to the main overview to see available packages, rooms, and photos."
          buttonLabel={`Back to ${name || "Overview"}`}
          backUrl={backUrl}
        />
      </div>
    </div>
  );
}
