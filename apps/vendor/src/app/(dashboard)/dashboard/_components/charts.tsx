'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
  Tooltip as RechartsTooltip // Aliased to avoid conflict
} from 'recharts';
import { DashboardData, ReservationChartItem, RevenueChartItem } from "../page";
import { BookingsDataTable } from "./bookingList";
import { useGetDashboard } from "@/services/tanstack.query";
import { PageSkeleton } from "../../(categories)/rooms/_components/details.skeleton";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as TooltipUI
} from "@/components/ui/tooltip";

// Helper functions and data (remain the same)
function getMonthName(num: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[num - 1] || "Invalid month";
}

// const reservationData = [
//   { day: '12 Jun', booked: 60, canceled: 20 },
//   { day: '13 Jun', booked: 65, canceled: 18 },
//   { day: '14 Jun', booked: 62, canceled: 25 },
//   { day: '15 Jun', booked: 72, canceled: 12 },
//   { day: '16 Jun', booked: 78, canceled: 15 },
//   { day: '17 Jun', booked: 64, canceled: 16 },
//   { day: '18 Jun', booked: 52, canceled: 35 },
// ];

const platformData = [
  { name: 'Direct Booking', value: 61, color: '#DCFCE7' },
  { name: 'Booking.com', value: 12, color: '#BDD5D0' },
  { name: 'Agoda', value: 11, color: '#D4D977' },
  { name: 'Airbnb', value: 9, color: '#8B5CF6' },
  { name: 'Hotels.com', value: 5, color: '#FEF9C3' },
  { name: 'Others', value: 2, color: '#F0FDF4' },
];

export function HotelDashboard({
  reservationDays,
  activePropertyId,
}: {
  reservationDays: number | undefined;
  activePropertyId?: string;
}) {
  const { data: s, isLoading } = useGetDashboard(reservationDays, activePropertyId);

  if (isLoading) return <PageSkeleton />;

  const dash = s?.data || { roomSummary: {}, recentBookings: [], revenueChart: [] };

  const revenuechartData = dash?.revenueChart?.map((v: RevenueChartItem) => ({
    name: v.month,
    revenue: v.revenue
  }));
  const reservationData = dash?.reservationChart?.map((v: ReservationChartItem) => ({
    day: v.date,
    booked: v.booked,
    canceled: v.cancelled
  }));


  const total = (dash.roomSummary.totalRooms || 0)

  const segments = [
    { label: "Occupied", value: dash.roomSummary.occupiedRooms, color: "bg-emerald-100" },
    { label: "AvailableRooms", value: dash.roomSummary.availableRooms, color: "bg-yellow-100" },
    // { label: "TotalRooms", value: dash.roomSummary.totalRooms, color: "bg-violet-500" },
    { label: "Not Ready", value: 0, color: "bg-lime-200" },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen space-y-2 font-sans">

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

          {/* Room Availability */}
          <Card className="col-span-1 border-none shadow-sm ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Room Availability</CardTitle>
              <MoreHorizontal className="h-5 w-5 text-slate-400 cursor-pointer" />
            </CardHeader>
            <CardContent>
              <div className="flex h-12 w-full rounded-lg overflow-hidden mb-6 border border-border/20">
                {segments.map((segment, idx) => {
                  const width = total > 0 ? ((segment.value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <TooltipUI key={idx}>
                      <TooltipTrigger asChild>
                        <div
                          style={{ width: `${width}%` }}
                          className={`${segment.color} transition-all duration-500 hover:opacity-80 cursor-pointer`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-background text-text border animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${segment.color}`} />
                          <span className="font-bold">{segment.label}:</span>
                          <span>{segment.value} ({width}%)</span>
                        </div>
                      </TooltipContent>
                    </TooltipUI>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-y-4">
                {segments.map((segment, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-1 h-8 ${segment.color} rounded-full`} />
                    <div>
                      <p className="text-xs text-slate-500">{segment.label}</p>
                      <p className="text-2xl font-bold">{segment.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="col-span-1 lg:col-span-2 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Revenue</CardTitle>
              <Select defaultValue="6months">
                <SelectTrigger className="w-[140px] bg-violet-500 text-white border-none">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenuechartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D1FAE5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#D1FAE5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis hide />
                  <RechartsTooltip
                    cursor={{ stroke: '#8B5CF6', strokeWidth: 2 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border p-2 rounded-md shadow-xl animate-in zoom-in-95 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] duration-300">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Revenue</p>
                            <p className="font-bold text-foreground">₹{payload[0].value?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Reservations and Platform Row */}
        <div className="grid grid-cols-1  gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Reservations</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border p-3 rounded-lg shadow-xl animate-in zoom-in-95 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] duration-300">
                            <p className="font-bold border-b mb-2 pb-1">{payload[0].payload.day}</p>
                            <div className="flex flex-col gap-1">
                              <p className="text-emerald-600 text-xs">Booked: <span className="font-bold">{payload[0].value}</span></p>
                              <p className="text-violet-600 text-xs">Canceled: <span className="font-bold">{payload[1].value}</span></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="booked" stackId="a" fill="#DCFCE7" barSize={30} />
                  <Bar dataKey="canceled" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Pie Chart */}
          {/* <Card className="border-none shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Booking by Platform</CardTitle></CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                {platformData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.value}%</span>
                      <span className="text-slate-500">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>

        <div>
          <BookingsDataTable bookings={dash.recentBookings} />
        </div>
      </div>
    </TooltipProvider>
  );
}