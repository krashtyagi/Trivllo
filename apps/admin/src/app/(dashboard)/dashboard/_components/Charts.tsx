'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChevronDown } from "lucide-react"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from '@/components/ui/button'
import { DailyBooking, MonthlyRevenue } from '../page'

/**
 * Helper to get month name
 */
export function getMonthName(dateStr: string, locale: string = 'en-US'): string {
  const date = new Date(`${dateStr}-01`);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
}

// 1. Define specific Chart Configurations
const bookingConfig = {
  count: {
    label: "Bookings",
    color: "#00f3ff", // Neon Blue
  },
}

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981",
  },
} satisfies ChartConfig

const Charts = ({ bookings: bookingData, revenue: r }: { bookings: DailyBooking[], revenue: MonthlyRevenue[] }) => {
  
  // 2. Prepare the revenue data with the month name
  const revenueData = r?.map((item) => ({
    ...item,
    monthname: getMonthName(item.month)
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
      {/* Daily Bookings Area Chart */}
      <Card className="lg:col-span-5 p-2">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Daily Bookings</CardTitle>
            <CardDescription>Last {bookingData?.length || 7} days</CardDescription>
          </div>
        </CardHeader>
  <CardContent className="h-[300px]">
    <ChartContainer config={bookingConfig} className="h-full w-full">
      <AreaChart 
        data={bookingData} 
        margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
            {/* Using the hardcoded neon blue for the glow effect */}
            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
        
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tickMargin={8}
          tickFormatter={(value) => value.split('-')[2]} 
        />

        {/* Fixing the negative dip: Setting domain [0, 'auto'] */}
        <YAxis 
          hide 
          domain={[0, 'auto']} 
        />

        <ChartTooltip 
          cursor={{ stroke: '#00f3ff', strokeWidth: 1 }} 
          content={<ChartTooltipContent indicator="dot" />} 
        />

        <Area 
          /* Changed from 'natural' to 'monotone' to prevent deep negative dips */
          type="monotone" 
          dataKey="count" 
          stroke="#00f3ff" 
          fill="url(#fillBookings)" 
          strokeWidth={3} 
          /* This ensures the shadow/glow looks sharp */
          activeDot={{ r: 6, style: { fill: "#00f3ff" } }}
        />
      </AreaChart>
    </ChartContainer>
  </CardContent>
</Card>

      {/* Monthly Revenue Bar Chart */}
      <Card className="lg:col-span-4 p-2">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
            <CardDescription>Performance Overview</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            Last 6 Months <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer config={revenueConfig} className="h-full w-full">
            <BarChart data={revenueData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis 
                dataKey="monthname" // Change XAxis to show the month name
                axisLine={false} 
                tickLine={false} 
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)} // Truncate to "Apr", "May" etc on axis
              />
              <ChartTooltip 
                cursor={false} 
                content={
                  <ChartTooltipContent 
                    hideLabel={false} // This ensures the monthname (the X-Axis key) shows as the header
                    labelKey="monthname" 
                  />
                } 
              />
              <Bar 
                dataKey="revenue" 
                fill="var(--color-revenue)" 
                radius={[4, 4, 0, 0]} 
                barSize={35} 
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default Charts