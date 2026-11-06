"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Clock,
    FileCheck2,
    CalendarX,
    HeartPulse,
    Luggage,
    Users,
    CloudSun,
    Leaf,
    Baby,
    CigaretteOff,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";

export default function TourPolicy({ id }: { id?: string }) {
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
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    {title}
                </h3>
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto space-y-4 pt-2">
            <div className="px-1">
                <h2 className="text-lg md:text-xl font-bold tracking-tight dark:text-zinc-300 text-zinc-800 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Tour & Travel Policies
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Standard international guidelines, safety regulations, and travel terms applicable to this tour.
                </p>
            </div>

            <Card className="overflow-hidden border sm:border shadow-sm rounded-2xl bg-card/60 backdrop-blur-sm">
                <CardContent className="p-0 divide-y divide-border/60">
                    
                    {/* Departure & Documentation (2-col grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
                        <PolicyItem icon={Clock} title="Reporting & Departure Time">
                            <span className="font-semibold text-foreground">Punctuality is mandatory.</span> Travelers must arrive at designated pickup/meeting points at least <span className="font-medium text-foreground">20–30 minutes before departure</span>. Delays may result in missing group transit without refund.
                        </PolicyItem>

                        <PolicyItem icon={FileCheck2} title="Valid Government ID & Permits">
                            Every guest must carry a valid <span className="font-semibold text-foreground">government-issued Photo ID</span> (Passport, National ID, Voter ID, or Driving License). Foreign nationals must carry original passports & required entry permits.
                        </PolicyItem>
                    </div>

                    {/* Cancellation & Rescheduling */}
                    <PolicyItem icon={CalendarX} title="Cancellation, Refunds & Rescheduling" alignTop>
                        <ul className="space-y-1 list-disc list-inside text-xs sm:text-sm">
                            <li><span className="font-medium text-foreground">Standard Notice:</span> Full/partial refunds apply according to the booked cancellation tier prior to departure.</li>
                            <li><span className="font-medium text-foreground">No-Show:</span> Failure to arrive on time or leaving mid-tour is strictly non-refundable.</li>
                        </ul>
                    </PolicyItem>

                    {/* Health & Safety + Luggage (2-col grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
                        <PolicyItem icon={HeartPulse} title="Health & Physical Fitness">
                            Participants must disclose relevant medical conditions before departure. High-altitude, trekking, or adventure activities require suitable physical fitness and adherence to mandatory safety gear.
                        </PolicyItem>

                        <PolicyItem icon={Luggage} title="Baggage & Valuables">
                            Standard limit: <span className="font-medium text-foreground">1 main rucksack/bag (up to 15 kg) + 1 small daypack</span> per traveler due to coach storage constraints. Please keep personal valuables in your daypack.
                        </PolicyItem>
                    </div>

                    {/* Group Harmony & Guide Instructions */}
                    <PolicyItem icon={Users} title="Group Harmony & Trip Leader Authority" alignTop>
                        Our group tours prioritize mutual respect and safety. Travelers must follow instructions given by certified trip captains and local guides. Operator reserves the right to offboard disruptive individuals without refund.
                    </PolicyItem>

                    {/* Weather / Force Majeure + Environmental Guidelines (2-col grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
                        <PolicyItem icon={CloudSun} title="Weather & Route Adjustments">
                            Itineraries may be modified in real-time due to severe weather, natural landslides, or official route closures to prioritize group safety.
                        </PolicyItem>

                        <PolicyItem icon={Leaf} title="Eco-Tourism & Leave No Trace">
                            Littering, damaging natural heritage, or disturbing wildlife is strictly prohibited. We maintain a strict zero-plastic & eco-friendly ethos.
                        </PolicyItem>
                    </div>

                    {/* Minor Policy + Substance Restrictions (2-col grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                        <PolicyItem icon={Baby} title="Children & Minor Policy">
                            Minors under 18 must be accompanied by a parent or legal guardian. Certain strenuous activities may have minimum age criteria.
                        </PolicyItem>

                        <PolicyItem icon={CigaretteOff} title="Substance & Smoking Restrictions">
                            Smoking, alcohol consumption, and prohibited substances are <span className="text-destructive font-semibold">strictly forbidden</span> inside transit vehicles and eco-sensitive zones.
                        </PolicyItem>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}