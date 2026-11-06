"use client";

import { RouterPush } from "@/components/RouterPush";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyBookings({ variant }: { variant: string }) {
  const router = useRouter();
  const { t } = useTranslation();

  const value = [{
    variant: "active",
    text: t("trips.noActiveBookings"),

  }, {
    variant: "pending",
    text: t("trips.noPendingBookings"),
  }, {
    variant: "all",
    text: t("trips.noAllBookings"),
  }, {
    variant: "cancelled",
    text: t("trips.noCancelledBookings"),
  }, {
    variant: "completed",
    text: t("trips.noCompletedBookings"),
  }]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-sm py-20 flex flex-col items-center text-center">

        {/* Icon Section */}
        <div className="mb-8">
          <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center">
            {/* Replace with your luggage SVG if needed */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            >
              <rect x="6" y="7" width="12" height="13" rx="2" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
        </div>

        {/* Button */}
        <Button
          variant="outline"
          className="rounded-lg mb-6"
          onClick={() => { RouterPush(router, "/") }}
        >
          <Search className="mr-2 h-4 w-4" />
          {t("trips.startSearching")}
        </Button>

        {/* Text */}
        <h2 className="text-lg font-semibold">
          {value.find((val) => val.variant === variant)?.text}
        </h2>

        <p className="text-muted-foreground mt-2">
          {t("trips.discoverNext")}
        </p>
      </div>
    </div>
  );
}