'use client'

import { SectionCards } from "@/components/section-cards";
import { useCurrentUser } from "@/services/queryes";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MessageModal } from "../(categories)/rooms/_components/RoomsListing";
import { PageSkeleton } from "../(categories)/rooms/_components/details.skeleton";
import { HotelDashboard } from "./_components/charts";
import { RatingAndTasks } from "./_components/tasks";
import { useGetDashboard } from "@/services/tanstack.query";
import { useChartRanges } from "@/context/auth/ChartRangesProvider";
import { MultiServiceDashboard } from "./_components/MultiServiceDashboard";
import { useVendorProperties } from "@/services/property.query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type DashboardData = {
  stats: Stats;
  roomSummary: RoomSummary;
  revenueChart: RevenueChartItem[];
  reservationChart: ReservationChartItem[];
  recentBookings: RecentBooking[];
};

export type Stats = {
  newBookings: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  grossRevenue?: number;
  taxDeducted?: number;
};

export type RoomSummary = {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
};

export type RevenueChartItem = {
  month: number;
  revenue: number;
};

export type ReservationChartItem = {
  date: string;
  booked: number;
  cancelled: number;
};

export type RecentBooking = {
  bookingReference: string;
  guestName: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "cancelled";
};

type Props = {};

const HotelDashboardContainer = () => {
  const { reservationDays } = useChartRanges();
  const { data: propertiesData } = useVendorProperties();
  const activePropertyId = propertiesData?.data?.activePropertyId;
  const { data: s, isLoading, refetch, isRefetching } = useGetDashboard(reservationDays, activePropertyId);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-getDashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-properties"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-roomTypes"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-getRooms"] }),
        queryClient.invalidateQueries({ queryKey: ["vendorReviews"] }),
        refetch(),
      ]);
      toast.success("Dashboard refreshed successfully!");
    } catch (err) {
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  const dash = s?.data || {
    roomSummary: {},
    recentBookings: [],
    revenueChart: [],
  };

  const isBusy = refreshing || isRefetching;

  return (
    <div className="md:flex-row flex flex-col gap-2 ">
      <div className="w-full space-y-2 ">
        <div className="flex items-center justify-between pb-1 px-0.5">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">Overview & Live Stats</h2>
            <p className="text-xs text-muted-foreground">Real-time room occupancy, arrivals, and revenue metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isBusy}
            className="gap-2 h-8 text-xs font-semibold rounded-xl border border-border/70 hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isBusy && "animate-spin text-primary")} />
            {isBusy ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <SectionCards dash={dash} />
        <HotelDashboard reservationDays={reservationDays} activePropertyId={activePropertyId} />
      </div>
      <div className="min-w-[300px]">
        <RatingAndTasks />
      </div>
    </div>
  );
};

const MultiServiceDashboardContainer = () => {
  return (
    <div className="md:flex-row flex flex-col gap-2 ">
      <div className="w-full space-y-2 ">
        <MultiServiceDashboard />
      </div>
      <div className="min-w-[300px]">
        <RatingAndTasks />
      </div>
    </div>
  );
};

const DashboardPage = (props: Props) => {
  const { data, isLoading } = useCurrentUser();
  const cat = data?.data?.vendor?.serviceType;

  if (isLoading) return <PageSkeleton />;

  return (
    <ErrorBoundary
      fallback={
        <MessageModal title="Error" description="Something went wrong" />
      }
    >
      <Suspense fallback={<PageSkeleton />}>
        {cat === "hotel" ? (
          <HotelDashboardContainer />
        ) : (
          <MultiServiceDashboardContainer />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default DashboardPage;
