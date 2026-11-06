"use client";

import React from "react";
import { 
  Ticket, 
  LifeBuoy, 
  CheckCircle2, 
  Archive, 
  History
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface TicketStatsData {
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

export function TicketStatsGrid({ stats }: { stats: TicketStatsData }) {
  const items = [
    {
      title: "Total Tickets",
      value: stats.totalTickets,
      description: "All time requests",
      icon: Ticket,
    },
    {
      title: "Active Tickets",
      value: stats.activeTickets,
      description: "Needs attention",
      icon: LifeBuoy,
    },
    {
      title: "Resolved",
      value: stats.resolvedTickets,
      description: "Fixed & Waiting",
      icon: CheckCircle2,
    },
    {
      title: "Closed",
      value: stats.closedTickets,
      description: "Archived issues",
      icon: Archive,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card 
          key={index} 
          className="border border-border bg-card/60 transition-colors hover:bg-card"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.title}
              </span>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="mt-3 space-y-1">
              <h3 className="text-3xl font-bold tracking-tight text-foreground">
                {item.value}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <History className="h-3 w-3 text-muted-foreground/60" />
                {item.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}