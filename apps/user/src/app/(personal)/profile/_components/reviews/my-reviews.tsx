"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CornerDownRight, Pencil, MessageSquare, ClipboardList } from "lucide-react";
import RattingBadge from "@/app/(home)/(categories)/_componentsRoot_categories/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import React, { useState } from "react";
import {
  useGetUserReviewBookingsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/services/personal/queryes";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function ReviewList() {
  const { data: response, isLoading } = useGetUserReviewBookingsQuery();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-3 w-64 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const pendingReviews = response?.data?.pendingReviews || [];
  const submittedReviews = response?.data?.submittedReviews || [];

  return (
    <div className="space-y-6 p-4 md:p-8 max-h-screen overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">My Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Share feedback on your stays and view your past reviews
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted/60 p-1 rounded-xl self-start">
          <Button
            variant={activeTab === "pending" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("pending")}
            className="rounded-lg text-xs gap-1.5"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Awaiting ({pendingReviews.length})
          </Button>
          <Button
            variant={activeTab === "submitted" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("submitted")}
            className="rounded-lg text-xs gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Submitted ({submittedReviews.length})
          </Button>
        </div>
      </div>

      <Separator />

      {activeTab === "pending" ? (
        pendingReviews.length === 0 ? (
          <Noreviews title="No pending reviews" description="You have reviewed all your completed bookings!" />
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((booking: any) => (
              <PendingReviewCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        )
      ) : submittedReviews.length === 0 ? (
        <Noreviews title="No reviews submitted yet" description="Your submitted reviews will appear here." />
      ) : (
        <div className="space-y-4">
          {submittedReviews.map((review: any) => (
            <SubmittedReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingReviewCard({ booking }: { booking: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [breakdown, setBreakdown] = useState({
    facilities: 0,
    cleanliness: 0,
    services: 0,
    comfort: 0,
    location: 0,
  });
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
      toast.error("Please rate all categories");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    createMutation.mutate(
      {
        bookingId: booking.bookingId,
        rating: Math.round(overallRating),
        comment: comment.trim(),
        breakdown,
      } as any,
      {
        onSuccess: () => {
          toast.success("Review submitted successfully!");
          setDialogOpen(false);
          setBreakdown({ facilities: 0, cleanliness: 0, services: 0, comfort: 0, location: 0 });
          setComment("");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to submit review");
        },
      }
    );
  };

  const formattedDate = booking.bookingDate
    ? format(new Date(booking.bookingDate), "dd MMM yyyy")
    : "";

  return (
    <Card className="rounded-xl bg-background shadow-sm border border-border/40 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase tracking-wider text-[10px]">
              Awaiting Review • {booking.companyType}
            </Badge>
            <h4 className="font-semibold text-base text-foreground capitalize">
              {booking.companyName || booking.companyType}
            </h4>
            <p className="text-xs text-muted-foreground">
              Booked on {formattedDate} • Ref: {booking.bookingReference}
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground gap-1.5 self-stretch sm:self-auto">
                <Star className="h-4 w-4 fill-white" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <p className="text-sm font-medium text-muted-foreground capitalize">
                  For: <span className="text-foreground">{booking.companyName || booking.companyType}</span>
                </p>

                {/* Category Ratings */}
                <div className="space-y-4">
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
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{overallRating.toFixed(1)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Overall Rating</p>
                      <p className="text-[10px] text-muted-foreground">Average of all categories</p>
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
                    className="bg-primary"
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
      </CardContent>
    </Card>
  );
}

function SubmittedReviewCard({ review }: { review: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState(review.comment);
  const [breakdown, setBreakdown] = useState({
    facilities: review.breakdown?.facilities || review.rating || 5,
    cleanliness: review.breakdown?.cleanliness || review.rating || 5,
    services: review.breakdown?.services || review.rating || 5,
    comfort: review.breakdown?.comfort || review.rating || 5,
    location: review.breakdown?.location || review.rating || 5,
  });
  const updateMutation = useUpdateReviewMutation();

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
    : review.rating;

  const handleUpdate = () => {
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    updateMutation.mutate(
      {
        reviewId: review._id,
        data: {
          rating: Math.round(overallRating),
          comment: comment.trim(),
          breakdown,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success("Review updated successfully!");
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update review");
        },
      }
    );
  };

  const formattedDate = review.createdAt
    ? format(new Date(review.createdAt), "dd MMM yyyy")
    : "";

  const canEdit = !review.vendorReply?.message;

  return (
    <Card className="rounded-xl bg-background shadow-sm border border-border/40 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase tracking-wider text-[10px]">
              Review Posted • {review.companyType}
            </Badge>
            <h4 className="font-semibold text-base text-foreground capitalize">
              {review.companyName}
            </h4>
            <p className="text-xs text-muted-foreground">
              Reviewed on {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RattingBadge rating={review.rating.toFixed(1)} variant="right" className="w-8 h-8" />
          </div>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-1 italic">
          &quot;{review.comment}&quot;
        </p>

        {review.breakdown && (
          <div className="grid grid-cols-5 gap-1.5 py-2 px-2.5 bg-muted/30 rounded-lg text-center text-xs">
            <div>
              <span className="block text-[10px] text-muted-foreground">Facilities</span>
              <span className="font-semibold">{review.breakdown.facilities || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Cleanliness</span>
              <span className="font-semibold">{review.breakdown.cleanliness || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Services</span>
              <span className="font-semibold">{review.breakdown.services || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Comfort</span>
              <span className="font-semibold">{review.breakdown.comfort || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground">Location</span>
              <span className="font-semibold">{review.breakdown.location || "—"}</span>
            </div>
          </div>
        )}

        {review.vendorReply?.message && (
          <div className="pl-3 border-l-2 border-primary/40 bg-muted/40 p-3 rounded-r-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <CornerDownRight className="h-4 w-4" />
              Property Response
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {review.vendorReply.message}
            </p>
          </div>
        )}

        {canEdit && (
          <div className="flex justify-end pt-1">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Your Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-2">
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    For: <span className="text-foreground">{review.companyName}</span>
                  </p>

                  {/* Category Ratings */}
                  <div className="space-y-4">
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
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{overallRating.toFixed(1)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Overall Rating</p>
                        <p className="text-[10px] text-muted-foreground">Average of all categories</p>
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
                      className="bg-primary"
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Updating..." : "Update Review"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const Noreviews = ({ title, description }: { title: string; description: string }) => {
  const navigate = useRouter();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-background shadow-sm border border-dashed border-border/60">
      <div className="relative w-36 h-36 rounded-md overflow-hidden opacity-80 mb-2">
        <Image src={"/no_r.png"} alt={"no reviews"} fill className="object-contain" />
      </div>

      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>

      <Button variant="outline" size="sm" onClick={() => navigate.push("/hotels")}>
        {t("reviews.exploreStays")}
      </Button>
    </div>
  );
};
