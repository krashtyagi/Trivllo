'use client'

import { IconTrendingDown, IconTrendingUp, IconCurrencyDollar, IconUsers, IconArrowUpRight, IconDoorEnter, IconDoorExit, IconCurrencyRupee } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardData } from "@/app/(dashboard)/dashboard/page" // adjust path if needed

// ────────────────────────────────────────────────
//  Card configuration – maps real stat keys → display
// ────────────────────────────────────────────────
const statCardsConfig = [
  {
    key: "totalRevenue" as const,
    title: "Total Revenue",
    description: "Net payout (after platform tax)",
    icon: IconCurrencyRupee,
    trendPrefix: "+",               // can be made dynamic later
    trendValue: "12.5%",           // ← placeholder – replace with real comparison later
    trendComparedTo: "net after tax",
    trendIcon: IconTrendingUp,
    valueFormatter: (val: number) => `₹${val.toLocaleString()}`,
    badgeVariant: "default" as const,
  },
  {
    key: "newBookings" as const,
    title: "Total Bookings",
    description: "Property bookings",
    icon: IconUsers,
    trendPrefix: "+",
    trendValue: "8.1%",
    trendComparedTo: "vs last month",
    trendIcon: IconTrendingUp,
    valueFormatter: (val: number) => val.toLocaleString(),
    badgeVariant: "default" as const,
  },
  {
    key: "todayCheckIns" as const,
    title: "Today Check-ins",
    description: "Expected arrivals today",
    icon: IconDoorEnter,
    trendPrefix: "",
    trendValue: "—",
    trendComparedTo: "today",
    trendIcon: null,                // no trend for today stats
    valueFormatter: (val: number) => val.toString(),
    badgeVariant: "secondary" as const,
  },
  {
    key: "todayCheckOuts" as const,
    title: "Today Check-outs",
    description: "Expected departures today",
    icon: IconDoorExit,
    trendPrefix: "",
    trendValue: "—",
    trendComparedTo: "today",
    trendIcon: null,
    valueFormatter: (val: number) => val.toString(),
    badgeVariant: "secondary" as const,
  },
] satisfies Array<{
  key: keyof DashboardData["stats"]
  title: string
  description: string
  icon: any
  trendPrefix: string
  trendValue: string
  trendComparedTo: string
  trendIcon: any | null
  valueFormatter: (val: number) => string
  badgeVariant?: "default" | "secondary" | "outline"
}>

export interface SectionCardsProps {
  dash: DashboardData
  isLoading?: boolean
}

export function SectionCards({ dash, isLoading }: SectionCardsProps) {
  const stats = dash?.stats ?? {
    newBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalRevenue: 0,
  }

  return (
    <div className="
      grid grid-cols-1 gap-2 sm:grid-cols-2 
      lg:grid-cols-4
      w-full
    ">
      {statCardsConfig.map((card, idx) => {
        const value = stats[card.key] as number
        const formattedValue = card.valueFormatter(value)

        const showTrend = card.trendIcon !== null

        return (
          <Card
            key={card.key}
            className="bg-gradient-to-t from-primary/5 to-card border-none shadow-sm rounded-3xl transition-all hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">
                  {card.title}
                </CardDescription>
                <card.icon className="h-5 w-5 text-muted-foreground/70" />
              </div>

              <CardTitle className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {formattedValue}
              </CardTitle>

              {showTrend && (
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  <Badge
                    variant={card.badgeVariant}
                    className={`
                      flex items-center gap-1 px-2 py-0.5
                      ${card.trendPrefix.startsWith("+") ? "text-green-600" : "text-red-600"}
                    `}
                  >
                    {card.trendIcon && <card.trendIcon size={14} />}
                    {card.trendPrefix}{card.trendValue}
                  </Badge>
                  <span className="text-muted-foreground">
                    {card.trendComparedTo}
                  </span>
                </div>
              )}

              {!showTrend && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.trendComparedTo}
                </p>
              )}

              {card.key === "totalRevenue" && typeof stats.taxDeducted === "number" && stats.taxDeducted > 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground/80 font-medium">
                  Tax deducted: ₹{stats.taxDeducted.toLocaleString()}
                </p>
              )}
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}