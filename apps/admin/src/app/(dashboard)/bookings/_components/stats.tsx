"use client";
export interface BookingStats {
  success: boolean;
  data: {
    totalBookings: number;
    todaysBookings: number;
    pendingPayments: number;
    cancellations: number;
  };
}

import React from "react";
import { 
  CalendarCheck, 
  CreditCard, 
  XCircle, 
  Sparkles,
  DollarSign
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function BookingStatsGrid({ stats }: { stats: BookingStats["data"] }) {
  if (!stats) return null;

  const items = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      description: "All-time property listings logs",
      icon: CalendarCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-t-blue-500",
      indicator: "Total activity active",
    },
    {
      title: "Today's Reservations",
      value: stats.todaysBookings,
      description: "Booked today",
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-t-purple-500",
      indicator: "Updated hourly",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      description: "Awaiting gateway confirmation",
      icon: CreditCard,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-t-amber-500",
      indicator: "Action required",
    },
    {
      title: "Cancellations",
      value: stats.cancellations,
      description: "Cancelled or refunded",
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-t-rose-500",
      indicator: "Review logs",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden border border-gray-200/80 dark:border-zinc-800 border-t-2 ${item.border} bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${item.bg} transition-transform group-hover:scale-105 duration-300`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {item.indicator}
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50 font-mono">
                  {item.value.toLocaleString()}
                </h3>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Decorative Background Icon */}
              <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-300 text-foreground pointer-events-none">
                <Icon size={120} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}