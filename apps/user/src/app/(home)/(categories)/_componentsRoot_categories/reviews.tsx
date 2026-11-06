"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetHotelReviews } from "@/services/hotel/querys";
import RattingBadge from "./badge";
import { format } from "date-fns";
import { CornerDownRight } from "lucide-react";

export type CompanyType = "hotel" | "cab" | "bike" | "adventure" | "tour";

interface ReviewsMainProps {
    companyId: string;
    CompanyType: CompanyType;
}

const ReviewsMain = ({ companyId, CompanyType }: ReviewsMainProps) => {
    const { data: response, isLoading } = useGetHotelReviews(companyId || "", CompanyType);
    if (!companyId) return null;

    if (isLoading) {
        return (
            <Card className="w-full bg-transparent border-none shadow-none p-0 animate-pulse">
                <CardHeader className="space-y-2 px-0">
                    <div className="h-8 w-32 bg-muted rounded" />
                    <div className="h-5 w-48 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-10 px-0 pt-4">
                    <div className="h-32 bg-muted rounded-2xl w-full" />
                </CardContent>
            </Card>
        );
    }

    const comments = response?.data?.reviews || [];
    const summary = response?.data?.summary || {};
    const averageRating = Number(summary.averageRating) || 0.0;
    const totalReviews = Number(summary.totalReviews) || 0;

    let ratingText = "Excellent";
    if (averageRating >= 4.5) ratingText = "Excellent";
    else if (averageRating >= 4.0) ratingText = "Very Good";
    else if (averageRating >= 3.0) ratingText = "Good";
    else if (averageRating >= 2.0) ratingText = "Fair";
    else if (averageRating > 0) ratingText = "Poor";
    else ratingText = "No Reviews";

    return (
        <Card className="w-full bg-transparent border-none shadow-none p-0">
            <CardHeader className="space-y-2 px-0">
                <h3 className="text-2xl font-bold dark:text-zinc-400 text-zinc-800">Reviews</h3>
                <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-primary/80 text-white hover:bg-primary px-2 py-0">
                        {averageRating.toFixed(1)}
                    </Badge>
                    <span className="font-semibold text-primary">{ratingText}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground font-medium">
                        {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-10 px-0 pt-4">
                <ReviewsRanges comments={comments} averageRating={averageRating} breakdown={summary.breakdown} />
                <ReviewsComments comments={comments} />
            </CardContent>
        </Card>
    );
};

export const ReviewsRanges = ({ comments = [], averageRating = 0.0, breakdown }: { comments: any[]; averageRating: number; breakdown?: any }) => {
    const categories = [
        { key: "facilities", label: "Facilities" },
        { key: "cleanliness", label: "Cleanliness" },
        { key: "services", label: "Services" },
        { key: "comfort", label: "Comfort" },
        { key: "location", label: "Location" },
    ];

    // Count star distributions (5, 4, 3, 2, 1)
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    comments.forEach((review: any) => {
        const r = Math.round(review.rating) as 5 | 4 | 3 | 2 | 1;
        if (starCounts[r] !== undefined) {
            starCounts[r]++;
        }
    });

    const totalCount = comments.length || 1; // avoid division by zero

    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full">
            <div className="w-full lg:w-[200px] shrink-0">
                <h4 className="font-medium mb-4 text-sm text-muted-foreground text-center lg:text-left">
                    Overall Rating
                </h4>
                <div className="space-y-2.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-3">{star}</span>
                            <Progress
                                value={((starCounts[star as 5 | 4 | 3 | 2 | 1] || 0) / totalCount) * 100}
                                className="h-1.5 flex-1"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Separator orientation="vertical" className="h-32 hidden lg:block" />

            <div className="w-full overflow-x-auto no-scrollbar pb-2">
                <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {categories.map((item) => {
                        const score = breakdown?.[item.key] || 0;
                        return (
                            <div key={item.key} className="flex flex-col items-center lg:items-start p-3 bg-muted/30 rounded-xl min-w-[120px] lg:min-w-0">
                                <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{item.label}</span>
                                <span className="text-lg font-bold">{score > 0 ? score.toFixed(1) : "—"}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ReviewsComments = ({ comments = [] }: { comments: any[] }) => {
    const visibleComments = comments.slice(0, 6); // Preview up to 6 comments in horizontal scroll

    if (comments.length === 0) {
        return (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-2xl">
                No reviews yet for this business.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Horizontal Scroll for desktop/mobile preview */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                {visibleComments.map((comment: any) => (
                    <ReviewCard key={comment._id} comment={comment} />
                ))}
            </div>

            <div className="flex justify-start">
                <MoreReviewsSideSheet
                    comments={comments}
                    trigger={
                        <Button variant="outline" className="rounded-full font-semibold">
                            Show all {comments.length} reviews
                        </Button>
                    }
                />
            </div>
        </div>
    );
};

const ReviewCard = ({ comment }: { comment: any }) => {
    const name = comment.userId
        ? `${comment.userId.firstName} ${comment.userId.lastName}`
        : "Guest";

    const formattedDate = comment.createdAt
        ? format(new Date(comment.createdAt), "dd MMM yyyy")
        : "";

    return (
        <Card className="rounded-2xl border border-border p-5 min-w-[280px] md:min-w-[350px] max-w-[400px] flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border">
                        <AvatarImage src={comment.userId?.avatar || `https://api.dicebear.com/10.x/initials/svg?seed=${name}`} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-sm leading-none mb-1">{name}</p>
                        <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                    </div>
                </div>
                <RattingBadge rating={comment.rating} variant="left" className="w-6 h-6 scale-90" />
            </div>

            <div className="flex-1 flex flex-col justify-between gap-3">
                <p className="text-sm text-zinc-600 leading-relaxed line-clamp-4">
                    {comment.comment || "No comment left."}
                </p>

                {comment.breakdown && (
                    <div className="grid grid-cols-5 gap-1 py-1.5 px-2 bg-muted/40 rounded-lg text-center text-xs">
                        <div>
                            <span className="block text-[9px] text-muted-foreground">Facilities</span>
                            <span className="font-semibold text-xs">{comment.breakdown.facilities || "—"}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-muted-foreground">Clean</span>
                            <span className="font-semibold text-xs">{comment.breakdown.cleanliness || "—"}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-muted-foreground">Services</span>
                            <span className="font-semibold text-xs">{comment.breakdown.services || "—"}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-muted-foreground">Comfort</span>
                            <span className="font-semibold text-xs">{comment.breakdown.comfort || "—"}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-muted-foreground">Location</span>
                            <span className="font-semibold text-xs">{comment.breakdown.location || "—"}</span>
                        </div>
                    </div>
                )}

                {comment.vendorReply?.message && (
                    <div className="mt-2 pl-3 border-l-2 border-primary/40 bg-zinc-50/50 p-2.5 rounded-r-xl space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                            <CornerDownRight className="h-3 w-3" />
                            Response from host
                        </div>
                        <p className="text-xs text-zinc-500 italic leading-relaxed">
                            {comment.vendorReply.message}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export function MoreReviewsSideSheet({ comments, trigger }: { comments: any[]; trigger: React.ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col" side="right">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Guest Reviews</SheetTitle>
                    <SheetDescription>What people are saying about their stay</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
                    {comments.map((comment: any) => (
                        <div key={comment._id} className="border-b pb-4 last:border-0 last:pb-0">
                            <ReviewCard comment={comment} />
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default ReviewsMain;