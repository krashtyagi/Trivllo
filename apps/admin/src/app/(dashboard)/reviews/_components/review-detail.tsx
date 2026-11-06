"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Trash2,
  Flag,
  Loader2,
  MessageCircleQuestion,
  ShieldCheck,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useReviewDetail, useDeleteReview, useFlagReview } from "../queryes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const formatDateTime = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface ReviewDetailProps {
  reviewId: string;
  onBack: () => void;
}

export function ReviewDetailView({ reviewId, onBack }: ReviewDetailProps) {
  const { data: res, isLoading } = useReviewDetail(reviewId);
  const deleteMutation = useDeleteReview();
  const flagMutation = useFlagReview();
  const [flagReason, setFlagReason] = useState("");
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);

  const detail = res?.data?.data;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(reviewId);
      toast.success("Review deleted successfully");
      onBack();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleFlag = async (isFlagged: boolean) => {
    try {
      await flagMutation.mutateAsync({
        reviewId,
        isFlagged,
        reason: flagReason || undefined,
      });
      toast.success(isFlagged ? "Review flagged" : "Review unflagged");
      setFlagReason("");
      setIsFlagDialogOpen(false);
    } catch {
      toast.error("Failed to update flag status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20 text-muted-foreground">Review not found</div>
    );
  }

  const rating = detail.rating;
  const comment = detail.comment;
  const createdAt = detail.createdAt;
  const user = detail.user;
  const company = detail.company;
  const vendor = detail.vendor;
  const vendorReply = detail.vendorReply;
  const moderation = detail.moderation || {};

  const userFullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Unnamed User";

  return (
    <div className="space-y-4">
      {/* Header buttons */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to reviews
        </Button>

        <div className="flex items-center gap-2">
          {/* Flag review */}
          {moderation.isFlagged ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlag(false)}
              className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Unflag Review
            </Button>
          ) : (
            <AlertDialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
                  <Flag className="h-4 w-4" />
                  Flag Review
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Flag Review</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please provide a reason why you are flagging this review.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                  <Textarea
                    placeholder="E.g., Inappropriate language, spam, fake review..."
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setFlagReason("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleFlag(true)}
                    disabled={!flagReason.trim()}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Flag Review
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Delete review */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Delete Review
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action is permanent and cannot be undone. It will remove the review and any replies.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-foreground">Review Content</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted {formatDateTime(createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-amber-600">{rating} / 5</span>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Comment</p>
                <p className="text-base text-foreground italic leading-relaxed">
                  "{comment || "No comment left."}"
                </p>
              </div>

              {moderation.isFlagged && moderation.flagReason && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertOctagon className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-700">Admin Flag Reason</h5>
                    <p className="text-xs text-rose-600/90 mt-0.5">{moderation.flagReason}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Reply */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageCircleQuestion className="h-4 w-4 text-primary/70" />
                Vendor Reply
              </h3>
            </div>
            <CardContent className="p-5">
              {vendorReply?.message ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{vendor?.businessName || "Vendor"}</span>
                    <span>{formatDateTime(vendorReply.repliedAt)}</span>
                  </div>
                  <div className="p-3 bg-muted rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                    {vendorReply.message}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  No reply from vendor yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info cards */}
        <div className="space-y-4">
          {/* User Details */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="text-sm font-semibold text-foreground">Reviewer</h4>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{userFullName}</p>
                  <p className="text-[10px] text-muted-foreground">Customer</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-xs">{user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-mono">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-xs">{user?.phoneNumber || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="text-sm font-semibold text-foreground">Service details</h4>
            </div>
            <CardContent className="p-4 space-y-3">
              <Badge variant="outline" className="capitalize font-medium bg-blue-500/10 text-blue-600 border-blue-500/20">
                {company?.type || "Service"}
              </Badge>
              {company && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{company.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">ID: {company.id}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vendor Details */}
          {vendor && (
            <Card className="border-border">
              <div className="p-4 border-b border-border bg-muted/20">
                <h4 className="text-sm font-semibold text-foreground">Vendor Details</h4>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{vendor.businessName}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2.5">
                  {vendor.businessEmail && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-muted-foreground text-xs">{vendor.businessEmail}</span>
                    </div>
                  )}
                  {vendor.businessPhone && (
                    <div className="flex items-center gap-3 text-sm font-mono">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-muted-foreground text-xs">{vendor.businessPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
