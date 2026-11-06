"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMyBookingsQuery } from "@/services/hotel/querys";
import { useTranslation } from "@/hooks/useTranslation";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { RouterPush } from "@/components/RouterPush";

import { useState } from "react";
import ReservationDetailsPage from "./details-trips";

import EmptyBookings from "./notrips";
import { SkeletonAvatar, SkeletonText } from "@/components/loader/skeleton";
type ReservationStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "active"
  | "all";
import NProgress from "nprogress"
export interface ReservationCardProps {
  hotelId: string;
  _id: string;
  hotelName: string;
  thumbnail: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  bookingId: string;
  status: ReservationStatus;
  onCheckDetails?: () => void;
}

export function AllReservations({
  variant,
}: {
  variant: "cancelled" | "all" | "completed" | "active";
}) {
  const { data: tripsdata_unfiltered, isLoading } = useMyBookingsQuery();
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "personal_data",
    shallow: true,
  });

  const trips = tripsdata_unfiltered?.data ?? [];

  const tripsdata =
    variant === "all"
      ? trips
      : trips.filter((val: ReservationCardProps) =>
        variant === "active"
          ? val.status === "confirmed" || val.status === "pending"
          : val.status === variant,
      );
  const [details, setDetails] = useState<{ id: string; open: boolean }>({
    id: "",
    open: false,
  });
  const { t } = useTranslation();
  if (isLoading) return <Skel />;
  if (!tripsdata) return <p>{t("trips.noBookings")}</p>;

  if (details.open)
    return <ReservationDetailsPage setDetails={setDetails} id={details.id} />;

  return (
    <div className="rounded-xl shadow-sm p-4 md:p-8 space-y-6 max-h-screen overflow-y-scroll bg-background border border-border/50">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{t("trips.allReservations")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("trips.manageBookings")}
          </p>
        </div>

        {/* Mobile Horizontal Booking Sub-navigation */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-border">
          {(["all", "active", "completed", "cancelled"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-full capitalize transition-all whitespace-nowrap border shrink-0",
                variant === item
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {t(`bookings.${item}`) || item}
            </button>
          ))}
        </div>
      </div>

      {tripsdata.length === 0 ? (
        <EmptyBookings variant={variant} />
      ) : (
        <div className="space-y-6">
          {tripsdata.map((val: any) => (
            <div key={val._id} className="space-y-6">
              <ReservationCard
                hotelId={val.hotelId || val._id}
                _id={val._id}
                hotelName={val.hotelName || val.title || "Reservation"}
                thumbnail={val.thumbnail || "/room1.png"}
                checkIn={val.checkIn || val.bookingDate}
                checkOut={val.checkOut || val.bookingDate}
                guests={{
                  adults: val.guests?.adults ?? 1,
                  children: val.guests?.children ?? 0,
                }}
                bookingId={val.bookingId || val.bookingReference}
                status={val.status}
                onCheckDetails={() => setDetails({ id: val._id, open: true })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Skel() {
  return (
    <div className="rounded-xl shadow-sm  p-8 space-y-6  max-h-screen overflow-y-scroll">
      <div>
        <SkeletonText />
      </div>

      {[...Array(6)].map((_, i) => {
        return <SkeletonAvatar key={i} />;
      })}
    </div>
  );
}






export function ReservationCard({
  hotelId,
  hotelName,
  thumbnail,
  checkIn,
  checkOut,
  guests,
  bookingId,
  status,
  _id,
  onCheckDetails,
}: ReservationCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isConfirmed = status === "confirmed";

  const totalGuests = (Number(guests?.adults) || 1) + (Number(guests?.children) || 0);

  return (
    <Card className="rounded-xl bg-background shadow-sm border border-border/40 hover:shadow-md transition-all duration-300">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6">
          {/* Left Section – Image + Info */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 items-start sm:items-center">
            {/* Hotel Image */}
            <div className="relative h-24 w-full sm:w-28 min-w-[112px] overflow-hidden rounded-xl border border-border/10">
              <img
                src={thumbnail || "/room1.png"}
                alt={hotelName}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Hotel Details */}
            <div className="flex-1 space-y-2">
              <h3
                onClick={() => {
                  RouterPush(router, `/hotels/${hotelId}`)
                }}
                className="font-semibold text-base md:text-lg cursor-pointer hover:text-primary transition-colors line-clamp-2"
              >
                {hotelName}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs md:text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">{t("trips.checkIn")}</span>{" "}
                  {checkIn && !isNaN(new Date(checkIn).getTime())
                    ? new Date(checkIn).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <span className="text-border hidden sm:inline">•</span>
                <p>
                  <span className="font-medium text-foreground">{t("trips.checkOut")}</span>{" "}
                  {checkOut && !isNaN(new Date(checkOut).getTime())
                    ? new Date(checkOut).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <span className="text-border hidden sm:inline">•</span>
                <p>
                  <span className="font-medium text-foreground">{t("trips.guests")}</span>{" "}
                  {totalGuests}
                  {totalGuests === 1 ? ` ${t("trips.person")}` : ` ${t("trips.people")}`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section – Status + Button */}
          <div className="flex flex-col items-stretch sm:items-end gap-3.5 mt-2 sm:mt-0 sm:min-w-[160px]">
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "px-2.5 py-0.5 text-xs font-semibold rounded-full",
                  isConfirmed
                    ? "border-green-500/30 bg-green-50/50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                    : "border-amber-500/30 bg-amber-50/50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                )}
              >
                {isConfirmed ? t("trips.confirmed") : status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>

              <span className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded border border-border/30">
                {bookingId}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="px-5 py-2 w-full sm:w-fit text-xs md:text-sm font-medium border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 rounded-lg shadow-sm"
              onClick={onCheckDetails}
            >
              {t("trips.details")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}