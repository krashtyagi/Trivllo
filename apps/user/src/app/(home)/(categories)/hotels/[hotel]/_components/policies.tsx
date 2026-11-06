"use client";

import React from "react";
import { PageSkeleton } from "@/components/loader/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { Card, CardContent } from "@/components/ui/card";
import { useGetHotelPolicies } from "@/services/hotel/querys";
import {
    DoorOpen,
    DoorClosed,
    CalendarX,
    Baby,
    Users,
    Moon,
    CigaretteOff,
    PawPrint,
    ShieldCheck,
} from "lucide-react";

export function HotelPolicies({ id }: { id: string }) {
    const { data, isLoading, isError } = useGetHotelPolicies(id);

    if (isLoading) return <PageSkeleton />;
    if (isError) return <MessageModal title="Error" description="Something went wrong" />;

    const PolicyItem = ({
        icon: Icon,
        title,
        children,
        alignTop = false,
    }: {
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        children: React.ReactNode;
        alignTop?: boolean;
    }) => (
        <div className={`flex ${alignTop ? 'items-start' : 'items-start'} gap-4 p-4 sm:p-5`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto space-y-4">
            <div className="px-1">
                <h2 className="text-lg md:text-xl font-bold tracking-tight dark:text-zinc-300 text-zinc-800 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Hotel Policies & House Rules
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Standard guest rules, timings, and property terms for your stay.
                </p>
            </div>

            <Card className="overflow-hidden border sm:border shadow-sm rounded-2xl bg-card/60 backdrop-blur-sm">
                <CardContent className="p-0 divide-y divide-border/60">
                    {/* Time Based Policies Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
                        <PolicyItem icon={DoorOpen} title="Check-in">
                            <span className="font-semibold text-foreground">12:00 PM – 11:00 PM</span>
                            <p className="text-xs mt-1 text-muted-foreground">
                                Please notify the property in advance if you expect to arrive after 11:00 PM.
                            </p>
                        </PolicyItem>
                        <PolicyItem icon={DoorClosed} title="Check-out">
                            <span className="font-semibold text-foreground">08:00 AM – 11:00 AM</span>
                            <p className="text-xs mt-1 text-muted-foreground">
                                Late check-out is subject to availability and room turnover.
                            </p>
                        </PolicyItem>
                    </div>

                    {/* Detailed Policies */}
                    <PolicyItem icon={CalendarX} title="Cancellation & Prepayment" alignTop>
                        Cancellation and prepayment policies vary by room type and rate plan. Please review specific conditions when selecting your room option.
                    </PolicyItem>

                    <PolicyItem icon={Baby} title="Children & Extra Beds" alignTop>
                        Children of all ages are welcome. Extra beds and cribs are subject to availability and room capacity.
                    </PolicyItem>

                    {/* Grid for rules */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                        <PolicyItem icon={Users} title="Age & ID Requirement">
                            Primary guest must be at least <span className="font-medium text-foreground">18 years of age</span> with a valid government-issued photo ID.
                        </PolicyItem>
                        <PolicyItem icon={Moon} title="Quiet Hours">
                            Quiet hours are observed between <span className="text-foreground font-semibold">22:00 (10:00 PM) and 07:00 (7:00 AM)</span> for all guests.
                        </PolicyItem>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                        <PolicyItem icon={CigaretteOff} title="Smoking Policy">
                            Smoking is <span className="text-destructive font-medium">strictly prohibited indoors</span>. Designated outdoor smoking areas are available.
                        </PolicyItem>
                        <PolicyItem icon={PawPrint} title="Pet Policy">
                            Pets are <span className="text-destructive font-medium">not allowed</span> on the property.
                        </PolicyItem>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}