"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, CornerDownRight, MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVendorReply } from "../hooks/useVendorReviews";
import { format } from "date-fns";
import { toast } from "sonner";

// 1. Main Section Component
export function CustomerReviewsSection({ comments = [] }: { comments: any[] }) {
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  const sortedReviews = [...comments].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "highest") {
      return b.rating - a.rating;
    }
    if (sortBy === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none cursor-pointer transition-colors"
          >
            <option value="newest" className="bg-white text-black">Newest</option>
            <option value="highest" className="bg-white text-black">Highest Rating</option>
            <option value="lowest" className="bg-white text-black">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-12 border rounded-2xl bg-muted/20 text-muted-foreground font-medium">
          No reviews available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedReviews.map((item) => (
            <CustomerReviewCard key={item._id} review={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// 2. Individual Card Component
export function CustomerReviewCard({ review }: { review: any }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState(review.vendorReply?.message || "");

  const replyMutation = useVendorReply();

  const handleReplySubmit = () => {
    if (!replyMessage.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }
    replyMutation.mutate(
      { reviewId: review._id, message: replyMessage },
      {
        onSuccess: () => {
          toast.success("Reply submitted successfully");
          setIsReplying(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to submit reply");
        },
      }
    );
  };

  const formattedDate = review.createdAt
    ? format(new Date(review.createdAt), "MMM dd, yyyy")
    : "N/A";

  const initials = `${review.userId?.firstName?.[0] || ""}${review.userId?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <Card className="rounded-2xl shadow-sm border bg-card hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <CardContent className="p-6 space-y-4 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          {/* Profile & Metadata */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-none">
                <AvatarFallback className="bg-violet-500 text-white font-bold text-sm">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : "Anonymous"}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  For: {review.companyName || "Service"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <span className="text-[10px] text-muted-foreground font-medium">• {formattedDate}</span>
          </div>

          {/* Review Text */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            &quot;{review.comment || "No comment left."}&quot;
          </p>

          {/* Breakdown Ratings */}
          {review.breakdown && (
            <div className="grid grid-cols-5 gap-1 py-1.5 px-2 bg-muted/40 rounded-lg text-center">
              <div>
                <span className="block text-[9px] text-muted-foreground">Fac</span>
                <span className="font-semibold text-[11px] text-foreground">{review.breakdown.facilities || "—"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-muted-foreground">Clean</span>
                <span className="font-semibold text-[11px] text-foreground">{review.breakdown.cleanliness || "—"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-muted-foreground">Serv</span>
                <span className="font-semibold text-[11px] text-foreground">{review.breakdown.services || "—"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-muted-foreground">Comf</span>
                <span className="font-semibold text-[11px] text-foreground">{review.breakdown.comfort || "—"}</span>
              </div>
              <div>
                <span className="block text-[9px] text-muted-foreground">Loc</span>
                <span className="font-semibold text-[11px] text-foreground">{review.breakdown.location || "—"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t">
          {/* Reply Section */}
          {review.vendorReply?.message ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                <span className="flex items-center gap-1">
                  <CornerDownRight className="h-3 w-3" />
                  Your Reply
                </span>
                {review.vendorReply.repliedAt && (
                  <span className="text-muted-foreground font-normal">
                    {format(new Date(review.vendorReply.repliedAt), "MMM dd, yyyy")}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {review.vendorReply.message}
              </p>
              <div className="flex justify-end pt-1">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-[10px] text-violet-600 hover:text-violet-700 font-semibold"
                  onClick={() => {
                    setReplyMessage(review.vendorReply.message);
                    setIsReplying(true);
                  }}
                >
                  Edit Reply
                </Button>
              </div>
            </div>
          ) : (
            !isReplying && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50/50 justify-start gap-1.5 text-xs font-semibold h-8 rounded-lg"
                onClick={() => setIsReplying(true)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Reply to review
              </Button>
            )
          )}

          {/* Inline Reply Input */}
          {isReplying && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-bold">Reply to customer</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-zinc-100 rounded-full"
                  onClick={() => {
                    setReplyMessage(review.vendorReply?.message || "");
                    setIsReplying(false);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
              <Textarea
                placeholder="Write your response..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="text-xs min-h-[60px] rounded-lg border-zinc-200 focus-visible:ring-violet-500"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-[10px] rounded-lg"
                  onClick={() => {
                    setReplyMessage(review.vendorReply?.message || "");
                    setIsReplying(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 bg-violet-600 hover:bg-violet-700 text-white text-[10px] rounded-lg gap-1"
                  onClick={handleReplySubmit}
                  disabled={replyMutation.isPending}
                >
                  <Send className="h-2.5 w-2.5" />
                  {replyMutation.isPending ? "Submitting..." : "Send Reply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 3. Star Helper
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted/20 text-muted/20"
          }`}
        />
      ))}
    </div>
  );
}