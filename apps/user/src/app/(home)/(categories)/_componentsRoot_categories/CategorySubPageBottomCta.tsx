"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CategorySubPageBottomCtaProps = {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  backUrl: string;
};

export function CategorySubPageBottomCta({
  title = "Ready to continue?",
  subtitle = "Return to the main overview to select dates, options, or complete your booking.",
  buttonLabel = "Back to Overview",
  backUrl,
}: CategorySubPageBottomCtaProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backUrl);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-border bg-muted/20 p-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Button
        onClick={handleBack}
        className="rounded-2xl px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md cursor-pointer shrink-0"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
