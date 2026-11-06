"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { amenityIconMap } from "@/components/ui/icons";
import { formatLabel } from "@/components/side-bar-filter/pillGroup";
import { CategorySubPageHeader } from "./CategorySubPageHeader";
import { CategorySubPageBottomCta } from "./CategorySubPageBottomCta";

type FullAmenitiesViewProps = {
  amenities: string[];
  title?: string;
  entityName?: string;
  categoryName?: "hotels" | "tours" | "tours/services" | string;
  backUrl: string;
};

export default function FullAmenitiesView({
  amenities = [],
  title = "Features & Amenities",
  entityName,
  categoryName = "hotels",
  backUrl,
}: FullAmenitiesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAmenities = useMemo(() => {
    if (!searchTerm.trim()) return amenities;
    const term = searchTerm.toLowerCase();
    return amenities.filter(
      (a) =>
        formatLabel(a).toLowerCase().includes(term) ||
        a.toLowerCase().includes(term)
    );
  }, [amenities, searchTerm]);

  const isTour = categoryName.includes("tour");

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Shared Header & Breadcrumbs */}
      <CategorySubPageHeader
        entityName={entityName}
        categoryName={categoryName}
        currentPageTitle="Amenities"
        backUrl={backUrl}
        maxWidthClass="max-w-6xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/5 via-muted/30 to-background p-6 sm:p-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Verified Inclusions
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {entityName ? `${entityName} — Amenities` : title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Browse through all {amenities.length} amenities, features, and complimentary
              services provided for an exceptional experience.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-3 py-1.5 backdrop-blur-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {amenities.length} Features Confirmed
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-3 py-1.5 backdrop-blur-xs">
              {isTour ? (
                <Compass className="h-4 w-4 text-primary" />
              ) : (
                <Building2 className="h-4 w-4 text-primary" />
              )}
              {isTour ? "Tour Package" : "Hotel Property"}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search features (e.g. WiFi, Pool, Breakfast)..."
              className="w-full rounded-2xl border border-border bg-muted/40 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="text-xs font-semibold text-muted-foreground self-end sm:self-center">
            Showing <span className="text-foreground font-bold">{filteredAmenities.length}</span> of {amenities.length} items
          </div>
        </div>

        {/* Amenities Grid */}
        {filteredAmenities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              No features match your search &ldquo;{searchTerm}&rdquo;
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="rounded-xl text-xs cursor-pointer"
            >
              Reset search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredAmenities.map((amenity) => {
              const iconKey = amenity.toLowerCase().replace(/\s+/g, "_");
              const Icon = amenityIconMap[iconKey] || amenityIconMap["breakfast"];

              return (
                <div
                  key={amenity}
                  className="group relative flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card/60 p-3.5 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {formatLabel(amenity.charAt(0).toUpperCase() + amenity.slice(1))}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Included
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Shared Bottom Navigation CTA */}
        <div className="pt-8">
          <CategorySubPageBottomCta
            title="Ready to continue?"
            subtitle="Return to the main overview to select dates, options, or complete your booking."
            buttonLabel="Back to Overview"
            backUrl={backUrl}
          />
        </div>
      </div>
    </div>
  );
}
