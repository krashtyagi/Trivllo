"use client";
import { BookingDetails } from "./details-trips-provider";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dispatch, SetStateAction, useState } from "react";
import { useBookingByIdQuery } from "@/services/hotel/querys";
import { cancelBooking } from "@/services/booking/booking.service";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { AnimatedModalDemo } from "./mapoverlay";
import { formatAddress } from "@/lib/utils";

export default function ReservationDetailsPage({
  setDetails,
  id,
}: {
  id: string;
  setDetails: Dispatch<SetStateAction<{ id: string; open: boolean }>>;
}) {
  const { data: bookingg, refetch, isLoading, isRefetching } = useBookingByIdQuery({ id });
  const [canceled, setCanceled] = useState(
    bookingg?.data?.status === "cancelled" ? "Cancelled" : "Cancel booking"
  );

  const booking = bookingg?.data;
  if (isLoading || isRefetching) return <TripsDetailsSkeleton />;
  if (!booking) return <MessageModal title="No Booking Found" description="Please return to home page" />;

  const handelCancelBooking = () => {
    cancelBooking(id)?.then(() => refetch());
    setCanceled("Cancelled");
  };
  const handelDownload = async () => {
    try {
      const res = await downloadBookings(id);

    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <Button
        variant="ghost"
        className="gap-2 px-0"
        onClick={() => setDetails((val) => ({ ...val, open: false }))}
      >
        <ArrowLeft size={16} />
        Back to trips
      </Button>

      <PropertyHeaderCard booking={booking} />

      <div className="rounded-xl shadow-sm bg-background p-4 md:p-6 space-y-4 border">
        <AboutPropertySection booking={booking} />
        <Separator />
        <PriceSection booking={booking} />
        <Separator />
        <AmenitiesSection booking={booking} />
        <Separator />

        {/* Responsive Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handelCancelBooking}
            disabled={canceled === "Cancelled"}
          >
            {canceled}
          </Button>
          <Button className="gap-2 w-full sm:w-auto"
            onClick={() => {
              handelDownload()
            }}>
            <Download size={16} />
            Download Invoice
          </Button>
        </div>

        {/* Review Section - shows after checkout/completion */}
        {(booking.status === "checked_out" || booking.status === "completed") && (
          <>
            <Separator />
            <WriteReviewSection bookingId={booking._id} hotelName={booking.hotel?.name} />
          </>
        )}
      </div>
    </div>
  );
}
import NProgress from 'nprogress'
import { RouterPush } from "@/components/RouterPush";
import Rupee from "@/components/Rupee";
import { downloadBookings } from "@/app/(personal)/book/[[...slug]]/_components/book.service";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useCreateReviewMutation } from "@/services/personal/queryes";
import { toast } from "sonner";
export function PropertyHeaderCard({ booking }: { booking: BookingDetails }) {
  const { hotel, checkIn, checkOut, status, roomsBooked } = booking;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const router = useRouter();

  return (
    <Card className="rounded-xl bg-background border shadow-sm">
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-4">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden shrink-0 cursor-pointer"
            onClick={() => {
              RouterPush(router, `/hotels/${hotel.hotelId}`)
            }}
          >
            <img src={hotel?.thumbnail} alt={hotel?.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1 md:space-y-2">
            <h2
              className="text-base md:text-lg font-semibold cursor-pointer"
              onClick={() => {
                RouterPush(router, `/hotels/${hotel.hotelId}`)
              }}
            >
              {hotel.name}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{formatAddress(hotel.address)}</p>
            <p className="hidden md:block text-sm text-muted-foreground">
              Coordinates: {hotel.coordinates[1]}, {hotel.coordinates[0]}
            </p>
          </div>
        </div>

        {/* Stats Row: Grid on small, flex on large */}
        <div className="grid grid-cols-3 md:flex items-center gap-4 md:gap-10 border-t pt-4 md:border-t-0 md:pt-0">
          <div className="text-center">
            <p className="text-[10px] md:text-sm text-muted-foreground">Check-In</p>
            <p className="text-lg md:text-2xl font-semibold">{checkInDate.getDate()}</p>
            <p className="text-[10px] md:text-sm">{checkInDate.toLocaleString("default", { month: "short" })}</p>
          </div>

          <div className="text-center">
            <p className="text-[10px] md:text-sm text-muted-foreground">Check-Out</p>
            <p className="text-lg md:text-2xl font-semibold">{checkOutDate.getDate()}</p>
            <p className="text-[10px] md:text-sm">{checkOutDate.toLocaleString("default", { month: "short" })}</p>
          </div>

          <div className="text-center">
            <Badge className="text-[10px] md:text-xs px-1 md:px-2 whitespace-nowrap">
              {status}
            </Badge>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-2">Rooms</p>
            <p className="text-lg md:text-2xl font-semibold">{roomsBooked}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AboutPropertySection({ booking }: { booking: BookingDetails }) {
  const { room, guests, hotel } = booking;
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h3 className="font-semibold">About this property</h3>
        <p className="text-sm text-muted-foreground">
          {guests.adults} adults · {guests.children} children
        </p>
        <p className="text-sm text-muted-foreground">Room Size: {room.roomSizeSqm} m²</p>
      </div>

      {/* Map: Full width on mobile, 1-col width on PC */}
      <div className="rounded-lg bg-background h-48 md:h-40 flex items-center justify-center border md:px-5">
        <AnimatedModalDemo cordinates={[hotel.coordinates[0], hotel.coordinates[1]]} />
      </div>
    </div>
  );
}

export function PriceSection({ booking }: { booking: BookingDetails }) {
  const { priceBreakdown } = booking;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Price</h3>
      <div className="max-w-md space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Price per night</span>
          <span className="text-foreground"><Rupee /> {priceBreakdown.pricePerNight}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Tax</span>
          <span className="text-foreground"><Rupee /> {priceBreakdown.taxAmount}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Cleaning Fee</span>
          <span className="text-foreground"><Rupee /> {priceBreakdown.cleaningFee}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Discount</span>
          <span className="text-red-500">- <Rupee /> {priceBreakdown.discountAmount}</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t">
          <span>Total Price</span>
          <span><Rupee /> {priceBreakdown.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}

export function AmenitiesSection({ booking }: { booking: BookingDetails }) {
  const { room } = booking;
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Amenities</p>
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {room.amenities.map((amenity: string, index: number) => (
          <div key={index} className="px-3 py-1 bg-muted rounded-md text-xs md:text-sm">
            {amenity}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TripsDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      {/* Back button */}
      <Skeleton className="h-9 w-32 rounded-md" />

      {/* PropertyHeaderCard Skeleton */}
      <Card className="rounded-xl bg-background border shadow-sm">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-4">
            {/* Image */}
            <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-md shrink-0" />
            {/* Text */}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 md:h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="hidden md:block h-4 w-40" />
            </div>
          </div>
          {/* Stats Row */}
          <div className="grid grid-cols-3 md:flex items-center gap-4 md:gap-10 border-t pt-4 md:border-t-0 md:pt-0">
            {/* Check-In */}
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 md:h-8 w-8" />
              <Skeleton className="h-3 w-10" />
            </div>
            {/* Check-Out */}
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 md:h-8 w-8" />
              <Skeleton className="h-3 w-10" />
            </div>
            {/* Rooms */}
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-3 w-10 mt-1" />
              <Skeleton className="h-6 md:h-8 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl shadow-sm bg-background p-4 md:p-6 space-y-4 border">
        {/* AboutPropertySection */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="rounded-lg h-48 md:h-40 flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>

        <Separator />

        {/* PriceSection */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <div className="max-w-md space-y-2">
            <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
            <div className="flex justify-between"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-16" /></div>
            <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
            <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
            <div className="flex justify-between pt-2 border-t mt-2"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-20" /></div>
          </div>
        </div>

        <Separator />

        {/* AmenitiesSection */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
        </div>

        <Separator />

        {/* Responsive Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Skeleton className="h-10 w-full sm:w-32 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function WriteReviewSection({ bookingId, hotelName }: { bookingId: string; hotelName?: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [breakdown, setBreakdown] = useState({
    facilities: 0,
    cleanliness: 0,
    services: 0,
    comfort: 0,
    location: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const createMutation = useCreateReviewMutation();

  const categories = [
    { key: "facilities" as const, label: "Facilities" },
    { key: "cleanliness" as const, label: "Cleanliness" },
    { key: "services" as const, label: "Services" },
    { key: "comfort" as const, label: "Comfort" },
    { key: "location" as const, label: "Location" },
  ];

  const filledCategories = Object.values(breakdown).filter((v) => v > 0);
  const overallRating = filledCategories.length > 0
    ? Math.round((filledCategories.reduce((a, b) => a + b, 0) / filledCategories.length) * 10) / 10
    : 0;

  const handleSubmit = () => {
    const allFilled = Object.values(breakdown).every((v) => v > 0);
    if (!allFilled) {
      toast.error("Please rate all 5 categories");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    createMutation.mutate(
      {
        bookingId,
        rating: Math.round(overallRating),
        comment: comment.trim(),
        breakdown,
      } as any,
      {
        onSuccess: () => {
          toast.success("Review submitted successfully!");
          setDialogOpen(false);
          setSubmitted(true);
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Failed to submit review";
          if (msg.includes("already submitted")) {
            setSubmitted(true);
            setDialogOpen(false);
          }
          toast.error(msg);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
          <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Thank you for your review!</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Your feedback helps other travelers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 p-4 md:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">How was your stay?</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/70">Share your experience across all amenities</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 self-stretch sm:self-auto">
              <Star className="h-4 w-4 fill-white" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <p className="text-sm font-medium text-muted-foreground">
                For: <span className="text-foreground font-semibold">{hotelName || "Your Stay"}</span>
              </p>

              {/* Category Ratings */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Rate each category</label>
                {categories.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground font-medium w-24 shrink-0">{label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="transition-transform hover:scale-110"
                          onClick={() => setBreakdown((prev) => ({ ...prev, [key]: star }))}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= breakdown[key]
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted/20 text-muted-foreground/30"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Rating Display */}
              {overallRating > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{overallRating.toFixed(1)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Overall Rating</p>
                    <p className="text-[10px] text-muted-foreground">Average of all 5 categories</p>
                  </div>
                </div>
              )}

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Your Review</label>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}