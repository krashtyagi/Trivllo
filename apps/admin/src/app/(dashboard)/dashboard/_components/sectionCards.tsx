'use client'

import { 
  IconTrendingUp, 
  IconUsers, 
  IconCurrencyRupee, 
  IconBuildingCommunity, 
  IconCalendarCheck,
  IconCalendarStats
} from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardStats } from "../page"

const statCardsConfig = [
  {
    key: "totalRevenue" as const,
    title: "Total Revenue",
    description: "Overall earnings",
    icon: IconCurrencyRupee,
    trendValue: "12.5%", 
    trendComparedTo: "vs last month",
    trendIcon: IconTrendingUp,
    valueFormatter: (val: number) => `₹${val.toLocaleString()}`,
  },
  {
    key: "totalBookings" as const,
    title: "Total Bookings",
    description: "Lifetime bookings",
    icon: IconCalendarCheck,
    trendValue: "8.1%",
    trendComparedTo: "vs last month",
    trendIcon: IconTrendingUp,
    valueFormatter: (val: number) => val.toLocaleString(),
  },
  {
    key: "todayBookings" as const,
    title: "Today's Bookings",
    description: "Bookings received today",
    icon: IconCalendarStats,
    trendValue: "New",
    trendComparedTo: "today",
    trendIcon: null,
    valueFormatter: (val: number) => val.toString(),
  },
  {
    key: "totalUsers" as const,
    title: "Total Users",
    description: "Registered customers",
    icon: IconUsers,
    trendValue: "Active",
    trendComparedTo: "platform",
    trendIcon: null,
    valueFormatter: (val: number) => val.toLocaleString(),
  },
  {
    key: "totalProperties" as const,
    title: "Properties",
    description: "Active listings",
    icon: IconBuildingCommunity,
    trendValue: "Live",
    trendComparedTo: "on site",
    trendIcon: null,
    valueFormatter: (val: number) => val.toString(),
  },
] satisfies Array<{
  key: keyof DashboardStats
  title: string
  description: string
  icon: any
  trendValue: string
  trendComparedTo: string
  trendIcon: any | null
  valueFormatter: (val: number) => string
}>

export function SectionCards({ data, loading }: { data: DashboardStats, loading: boolean }) {
  
  const stats = data ?? {
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCardsConfig.map((config) => {
        const Icon = config.icon
        const TrendIcon = config.trendIcon
        const rawValue = stats[config.key]
        
        return (
          <Card key={config.key} className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                {config.title}
              </CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md mb-2" />
              ) : (
                <CardTitle className="text-2xl font-bold">
                  {config.valueFormatter(rawValue)}
                </CardTitle>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                {loading ? (
                  <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
                ) : (
                  <>
                    <div className="flex items-center gap-0.5 text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                      {TrendIcon && <TrendIcon size={12} />}
                      {config.trendValue}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {config.trendComparedTo}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}