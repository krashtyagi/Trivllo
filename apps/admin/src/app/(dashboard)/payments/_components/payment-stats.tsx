"use client";

import React from "react";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  AlertTriangle,
  RotateCcw,
  History,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentStatsData {
  totalRevenue: number;
  todaysRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  refundAmount: number;
}

const formatCurrency = (amount: number) => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

export function PaymentStatsGrid({ stats }: { stats: PaymentStatsData }) {
  const items = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      description: "All time earnings",
      icon: IndianRupee,
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats?.todaysRevenue || 0),
      description: "Collected today",
      icon: TrendingUp,
    },
    {
      title: "Pending",
      value: stats?.pendingPayments || 0,
      description: "Awaiting capture",
      icon: Clock,
    },
    {
      title: "Failed",
      value: stats?.failedPayments || 0,
      description: "Payment failures",
      icon: AlertTriangle,
    },
    {
      title: "Refunded",
      value: formatCurrency(stats?.refundAmount || 0),
      description: "Refunds processed",
      icon: RotateCcw,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
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
