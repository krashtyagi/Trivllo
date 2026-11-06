"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCurrencyRupee,
  IconUsers,
  IconCalendarEvent,
  IconDoorExit,
} from "@tabler/icons-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  useMultiServiceStats,
  useMultiServiceAnalytics,
  useMultiServiceRecentBookings,
} from "@/services/multiservice.query";
import { PageSkeleton } from "../../(categories)/rooms/_components/details.skeleton";
import { useRouter } from "next/navigation";
import { Eye, Mountain, Car, Bike, Compass } from "lucide-react";

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amt);

const serviceIcons: Record<string, React.ElementType> = {
  adventure: Mountain,
  cab: Car,
  bike: Bike,
  tour: Compass,
};

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  pending: "bg-amber-500/10 text-amber-700 border-amber-200",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-200",
  completed: "bg-blue-500/10 text-blue-700 border-blue-200",
};

export function MultiServiceDashboard() {
  const router = useRouter();
  const [revenueRange, setRevenueRange] = React.useState("6m");
  const [bookingRange, setBookingRange] = React.useState("7d");

  // Fetch Stats
  const { data: statsData, isLoading: statsLoading } = useMultiServiceStats();
  // Fetch Analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useMultiServiceAnalytics({
    revenueRange,
    bookingRange,
  });
  // Fetch Recent Bookings
  const { data: recentData, isLoading: recentLoading } = useMultiServiceRecentBookings({
    limit: 5,
  });

  if (statsLoading || analyticsLoading || recentLoading) {
    return <PageSkeleton />;
  }

  const stats = statsData?.data?.data || {
    totalRevenue: 0,
    totalBookings: 0,
    newBookings: 0,
    cancelledBookings: 0,
  };

  const analytics = analyticsData?.data?.data || {
    revenue: [],
    bookings: [],
  };

  const recentBookings = recentData?.data?.data || [];

  const statCardsConfig = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: "Earnings this month",
      icon: IconCurrencyRupee,
      badgeVariant: "default" as const,
      color: "bg-emerald-50 hover:bg-emerald-100/50",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      description: "Bookings this month",
      icon: IconCalendarEvent,
      badgeVariant: "default" as const,
      color: "bg-violet-50 hover:bg-violet-100/50",
    },
    {
      title: "New Bookings",
      value: stats.newBookings.toLocaleString(),
      description: "Bookings received today",
      icon: IconUsers,
      badgeVariant: "secondary" as const,
      color: "bg-blue-50 hover:bg-blue-100/50",
    },
    {
      title: "Cancelled Bookings",
      value: stats.cancelledBookings.toLocaleString(),
      description: "Cancelled reservations",
      icon: IconDoorExit,
      badgeVariant: "secondary" as const,
      color: "bg-rose-50 hover:bg-rose-100/50",
    },
  ];

  return (
    <div className="w-full space-y-2 font-sans animate-in fade-in duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {statCardsConfig.map((card, idx) => (
          <Card
            key={idx}
            className="bg-gradient-to-t from-primary/5 to-card border-none shadow-sm rounded-3xl transition-all hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground text-xs font-semibold">
                  {card.title}
                </CardDescription>
                <card.icon className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <CardTitle className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {card.value}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Revenue Area Chart */}
        <Card className="col-span-1 lg:col-span-2 border-none shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Revenue</CardTitle>
            <Select value={revenueRange} onValueChange={setRevenueRange}>
              <SelectTrigger className="w-[120px] bg-violet-500 text-white border-none h-9 rounded-xl">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[250px] relative pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D1FAE5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#D1FAE5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis hide />
                <RechartsTooltip
                  cursor={{ stroke: "#8B5CF6", strokeWidth: 2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-2 rounded-xl shadow-xl animate-in zoom-in-95 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] duration-300">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            Revenue
                          </p>
                          <p className="font-bold text-foreground">
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Bar Chart */}
        <Card className="col-span-1 border-none shadow-sm rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Bookings Volume</CardTitle>
            <Select value={bookingRange} onValueChange={setBookingRange}>
              <SelectTrigger className="w-[100px] h-8 text-xs border bg-muted/40 rounded-lg">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="15d">15 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[250px] relative pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.bookings}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-2.5 rounded-xl shadow-xl animate-in zoom-in-95 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] duration-300">
                          <p className="font-bold border-b mb-1 pb-0.5 text-xs">
                            {payload[0].payload.date}
                          </p>
                          <p className="text-violet-600 text-xs font-bold">
                            Bookings: <span>{payload[0].value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Card */}
      <Card className="border-none shadow-sm rounded-3xl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
            <CardDescription className="text-xs">Latest guest reservations</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-violet-500 hover:text-violet-600"
            onClick={() => router.push("/reservation")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b">
                  <TableHead className="text-[10px] uppercase font-bold px-5">Guest</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-5">Service</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-5">Date</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-5">Amount</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold px-5">Status</TableHead>
                  <TableHead className="text-right text-[10px] uppercase font-bold px-5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length ? (
                  recentBookings.map((b: any) => {
                    const Icon = serviceIcons[b.serviceType] || Compass;
                    const status = (b.status || "pending").toLowerCase();
                    const initials = b.customerName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <TableRow key={b.id} className="hover:bg-muted/20 border-b last:border-none">
                        <TableCell className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-foreground truncate">
                                {b.customerName}
                              </span>
                              <code className="text-[9px] font-mono text-muted-foreground">
                                {b.bookingReference}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-5">
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <div className="p-1 bg-muted rounded-md border text-muted-foreground shrink-0">
                              <Icon size={12} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-foreground truncate">
                                {b.serviceTitle}
                              </span>
                              <span className="text-[9px] text-muted-foreground truncate capitalize">
                                {b.serviceDetails}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-xs text-muted-foreground font-medium">
                          {new Date(b.bookingDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="py-3 px-5 font-mono text-xs font-bold text-foreground">
                          {formatCurrency(b.amount)}
                        </TableCell>
                        <TableCell className="py-3 px-5">
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 ${
                              statusStyles[status] ||
                              "bg-amber-500/10 text-amber-700 border-amber-200"
                            }`}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => router.push(`/reservation/user/${b.id}`)}
                          >
                            <Eye size={12} className="text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground italic">
                      No recent bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
