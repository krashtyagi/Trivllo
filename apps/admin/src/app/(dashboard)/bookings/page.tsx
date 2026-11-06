'use client'
import React from 'react'
import { useBookings, useBookingStats } from './queryes'
import { BookingsDataTable } from './_components/bookingsTable';
import { BookingStatsGrid } from './_components/stats';
import { PageSkeleton } from '@/components/loaders/loader/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

type Props = {}
export interface BookingSummary {
  _id: string;
  bookingReference: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "refunded";
  createdAt: string;
  userName: string;
  serviceType: string;
  serviceName: string;
  city: string;
  status: "ongoing" | "upcoming" | "completed" | "cancelled";
}

export interface BookingResponse {
  success: boolean;
  data: {
    bookings: BookingSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

const Page = (props: Props) => {
  const queryClient = useQueryClient();
  const { data, isLoading: b, isRefetching: br, refetch: refetchBookings } = useBookings();
  const { data: d, isLoading: s, isRefetching: sr, refetch: refetchStats } = useBookingStats();

  const handleRefresh = () => {
    refetchBookings();
    refetchStats();
  };

  const isPageLoading = b || s;
  const isPageRefetching = br || sr;

  if (isPageLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="p-1 sm:p-3 md:p-2 max-w-full  space-y-2 md:space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
            Booking Reservations
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground hidden sm:block">
            Monitor reservation requests, payments, and checkout schedules in real-time.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isPageRefetching}
          className="self-start md:self-auto gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPageRefetching ? "animate-spin" : ""}`} />
          Refresh Bookings
        </Button>
      </div>

      <BookingStatsGrid stats={d?.data?.data} />
      <BookingsDataTable bookings={data?.data?.data?.bookings || []} />
    </div>
  );
};

export default Page;