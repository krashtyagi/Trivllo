"use client";

import React from 'react';
import { ItineraryDay } from '@/app/(home)/(categories)/tours/services/[serviceid]/_components/HotelItems';
import { MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ChangelogContentProps {
    releases?: ItineraryDay[];
}

const parseDescriptionItems = (text: string): { isList: boolean; items: string[] } => {
    if (!text) return { isList: false, items: [] };

    const bulletRegex = /[▪︎▪•●◆➢➤]/;
    const hasBullets = bulletRegex.test(text);
    const hasNewlines = text.includes("\n");

    if (hasBullets || hasNewlines) {
        const rawItems = text
            .split(/[▪︎▪•●◆➢➤]|\r?\n/)
            .map((item) => item.replace(/^[-*•▪︎▪●◆➢➤\s]+/, "").trim())
            .filter((item) => item.length > 0);

        if (rawItems.length > 0) {
            return { isList: true, items: rawItems };
        }
    }

    return { isList: false, items: [text.trim()] };
};

const ChangelogContent = ({ releases = [] }: ChangelogContentProps) => {
    if (!releases || releases.length === 0) {
        return (
            <div className="mx-auto py-8 text-center text-muted-foreground border border-dashed rounded-xl">
                <p className="text-sm">No detailed itinerary available for this tour package.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto py-3 md:py-4 rounded-xl border border-border bg-card/30 px-3 sm:px-3">
            {releases.map((release, index) => (
                <div
                    key={release.day}
                    className='relative flex group min-h-[120px]'
                >
                    {/* --- Left Side: Day Label (Desktop Only) --- */}
                    <div className='hidden md:flex flex-col items-end w-24 pr-8 shrink-0'>
                        <div className="sticky top-24 pt-1 transition-all duration-300 group-hover:translate-x-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 block">
                                Day
                            </span>
                            <span className="text-4xl font-black text-primary/40 group-hover:text-primary transition-colors">
                                {release.day}
                            </span>
                        </div>
                    </div>

                    {/* --- Center: Timeline Track --- */}
                    <div className='flex flex-col items-center shrink-0 w-8 md:w-10'>
                        {/* Sticky Marker */}
                        <div className="sticky top-24 z-20 flex size-8 md:size-10 items-center justify-center">
                            <div>
                                <MapPin className="size-3 md:size-5 text-primary fill-primary/10 hidden md:block" />
                                <span className="md:hidden text-sm font-black text-primary mr-2">Day {release.day}</span>
                            </div>
                        </div>

                        {/* Vertical Connector Line */}
                        <div className={cn(
                            "w-px flex-1 bg-border my-[-10px] md:my-[-20px]",
                            index === releases.length - 1 ? "bg-transparent" : "bg-gradient-to-b from-border via-border to-transparent",
                            "group-hover:bg-primary/30 transition-colors"
                        )} />
                    </div>

                    {/* --- Right Side: Content --- */}
                    <div className='flex-1 pb-12 md:pb-24 pl-4 md:pl-12'>

                        {/* Mobile Header */}
                        <div className='md:hidden sticky top-20 hidden md:block z-10 bg-background/95 backdrop-blur-md py-2 mb-3 flex items-center gap-2 border-b border-border/50'>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Day</span>
                            <span className="text-2xl font-black text-primary">{release.day}</span>
                            <div className="h-px flex-1 bg-border/30 ml-2" />
                        </div>

                        <h3 className='text-lg md:text-xl font-bold tracking-tight text-foreground mb-3 group-hover:text-primary transition-colors duration-300'>
                            {release.title}
                        </h3>

                        <div className='space-y-3 md:space-y-4'>
                            {/* --- Description rendering with bullet/newline support --- */}
                            {release.description && (() => {
                                const { isList, items } = parseDescriptionItems(release.description);

                                if (!isList || items.length === 1 && !/[▪︎▪•●◆➢➤]/.test(release.description)) {
                                    return (
                                        <p className='text-muted-foreground leading-relaxed text-sm md:text-base max-w-2xl'>
                                            {items[0]}
                                        </p>
                                    );
                                }

                                return (
                                    <ul className='space-y-2 max-w-2xl'>
                                        {items.map((item, dIdx) => (
                                            <li key={dIdx} className='flex items-start gap-2.5 text-muted-foreground text-xs sm:text-sm md:text-[15px] leading-relaxed'>
                                                <span className='text-primary shrink-0 text-xs mt-1 select-none'>▪</span>
                                                <span className='flex-1'>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}

                            {/* --- Highlights --- */}
                            {release.highlights && release.highlights.length > 0 && (
                                <ul className='grid gap-1 md:gap-1.5 pt-1'>
                                    {release.highlights.map((highlight, hIndex) => (
                                        <li key={hIndex} className='flex items-start gap-1.5 bg-muted/20 md:bg-muted/30 p-1.5 md:p-2 rounded-lg transition-all'>
                                            <div className='mt-1.5 size-1 shrink-0 rounded-full bg-primary/40' />
                                            <span className='text-muted-foreground/90 text-xs md:text-sm leading-snug'>
                                                {highlight}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChangelogContent;