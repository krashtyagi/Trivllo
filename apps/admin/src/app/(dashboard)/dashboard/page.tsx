'use client'
import React from 'react'

type Props = {}
export interface DailyBooking {
  date: string;
  count: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
}

export interface DashboardCharts {
  dailyBookings: DailyBooking[];
  monthlyRevenue: MonthlyRevenue[];
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
}

// Main response wrapper
export interface DashboardResponse {
  data: DashboardData;
}
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type ServiceType = "hotel" | "resort" | "apartment";

export interface Booking {
  _id: string;
  bookingReference: string;
  checkIn: string; // ISO Date String
  checkOut: string; // ISO Date String
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  userName: string;
  propertyName: string;
  serviceType: ServiceType;
}

export interface BookingResponse {
  success: boolean;
  data: Booking[];
}
const page = (props: Props) => {
  return (
    <Dashboard />
  )
}
export default page


import { useDashboard, useRecentBookings } from './queryes'
import { SectionCards } from './_components/sectionCards';
import Charts from './_components/Charts';
import { BookingsDataTable } from './_components/BookingList';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Dashboard() {
  const {data:d , isLoading , refetch , isRefetching} = useDashboard()
  const data  = d?.data?.data as DashboardData
  const {data:recentBookingsData , isLoading:recentBookingsLoading, refetch: refetchBookings, isRefetching: isRefetchingBookings} = useRecentBookings()

  const handleRefresh = () => {
    refetch();
    refetchBookings();
  };

  const isAnyRefetching = isRefetching || isRefetchingBookings;

  return (
    <div className="min-h-screen space-y-3 font-sans">

      {/* Dashboard Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your platform performance</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isAnyRefetching}
          className="gap-2 h-9"
        >
          <RefreshCw className={`h-4 w-4 ${isAnyRefetching ? 'animate-spin' : ''}`} />
          {isAnyRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* 1. Top Stats Row */}
      <SectionCards data={data?.stats} loading={isLoading}/>

      {/* 2. Charts Row */}
      <Charts 
      revenue={data?.charts?.monthlyRevenue}
      bookings={data?.charts?.dailyBookings}
      />

      {/* 3. Table Row */}
      <div className="flex gap-3 w-full">
        <BookingsDataTable  bookings={recentBookingsData?.data?.data || [] as Booking[]} />
      </div>
    </div>
  )
}