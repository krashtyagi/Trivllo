"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  Users,
  Mountain,
  Car,
  Bike,
  Compass,
  FileText,
  Info,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMultiServiceBookingById } from "@/services/multiservice.query";
import { PageSkeleton } from "../../(categories)/rooms/_components/details.skeleton";

// Types matching the backend getVendorBookingById response
interface BookingDetailData {
  id: string;
  bookingReference: string;
  service: {
    title: string;
    type: string;
    subType: string | null;
    details: Record<string, any>;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  bookingDate: string;
  timeSlot: string | null;
  participants: Array<{ name?: string; age?: number; gender?: string }>;
  meta: Record<string, any>;
  extraInfo: Record<string, any>;
  pricing: {
    baseAmount: number;
    taxAmount: number;
    taxPercentage: number;
    totalAmount: number;
  };
  quantity: number;
  duration: { totalDays?: number; startDate?: string; endDate?: string } | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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

const statusBadge: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  pending: "bg-amber-500/10 text-amber-700 border-amber-200",
  cancelled: "bg-rose-500/10 text-rose-700 border-rose-200",
  completed: "bg-blue-500/10 text-blue-700 border-blue-200",
};

const paymentBadge: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  pending: "bg-amber-500/10 text-amber-700 border-amber-200",
  refunded: "bg-zinc-500/10 text-zinc-600 border-zinc-200",
  failed: "bg-rose-500/10 text-rose-700 border-rose-200",
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="p-1.5 bg-muted rounded-md mt-0.5 shrink-0">
          <Icon size={14} className="text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function MultiServiceBookingDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: result, isLoading } = useMultiServiceBookingById(id);

  if (isLoading) return <PageSkeleton />;

  const booking: BookingDetailData | undefined = result?.data?.data;

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Booking not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const ServiceIcon = serviceIcons[booking.service.type] || Compass;
  const status = (booking.status || "pending").toLowerCase();
  const payment = (booking.paymentStatus || "pending").toLowerCase();
  const initials = booking.customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-1 sm:p-3 md:p-2 max-w-[1200px] mx-auto animate-in fade-in duration-300">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {booking.bookingReference}
              </h1>
              <Badge variant="outline" className={`text-[10px] uppercase font-bold ${statusBadge[status] || statusBadge.pending}`}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Booked on {formatDate(booking.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] uppercase font-bold self-start ${paymentBadge[payment] || paymentBadge.pending}`}>
          Payment: {payment}
        </Badge>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
        {/* Customer Card */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-1">
              <Avatar className="h-12 w-12 rounded-xl border border-border">
                <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{booking.customer.name}</p>
                <p className="text-xs text-muted-foreground">{booking.service.type} booking</p>
              </div>
            </div>
            <Separator />
            <InfoRow label="Email" value={booking.customer.email || "N/A"} icon={Mail} />
            <InfoRow label="Phone" value={booking.customer.phone || "N/A"} icon={Phone} />
          </CardContent>
        </Card>

        {/* Service & Booking Info */}
        <Card className="rounded-xl border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ServiceIcon size={16} className="text-muted-foreground" />
              Service & Booking Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
              <InfoRow label="Service" value={booking.service.title} icon={FileText} />
              <InfoRow label="Category" value={booking.service.type.toUpperCase()} icon={Info} />
              <InfoRow label="Booking Date" value={formatDate(booking.bookingDate)} icon={Calendar} />
              {booking.timeSlot && <InfoRow label="Time Slot" value={booking.timeSlot} icon={Clock} />}
              {booking.quantity > 0 && <InfoRow label="Quantity / Persons" value={String(booking.quantity)} icon={Users} />}
              {booking.duration?.totalDays && (
                <InfoRow label="Duration" value={`${booking.duration.totalDays} Day${booking.duration.totalDays > 1 ? "s" : ""}`} icon={Calendar} />
              )}
              {booking.duration?.startDate && (
                <InfoRow label="Start Date" value={formatDate(booking.duration.startDate)} icon={Calendar} />
              )}
              {booking.duration?.endDate && (
                <InfoRow label="End Date" value={formatDate(booking.duration.endDate)} icon={Calendar} />
              )}
              {booking.service.subType && (
                <InfoRow label="Sub Type" value={booking.service.subType} icon={Info} />
              )}
            </div>

            {/* Extra Info / Route */}
            {booking.extraInfo && Object.keys(booking.extraInfo).length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Additional Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {Object.entries(booking.extraInfo).map(([key, val]) => (
                    <InfoRow key={key} label={key} value={String(val)} icon={MapPin} />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing & Participants Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Pricing Card */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Receipt size={16} className="text-muted-foreground" />
              Pricing Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Amount</span>
              <span className="font-medium">{formatCurrency(booking.pricing.baseAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({booking.pricing.taxPercentage}%)</span>
              <span className="font-medium">{formatCurrency(booking.pricing.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(booking.pricing.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Participants Card */}
        {booking.participants && booking.participants.length > 0 && (
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                Participants ({booking.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {booking.participants.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-foreground">{p.name || "N/A"}</span>
                      {p.age && <span className="text-muted-foreground ml-2">Age: {p.age}</span>}
                      {p.gender && <span className="text-muted-foreground ml-2">• {p.gender}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meta Info (if no participants) */}
        {(!booking.participants || booking.participants.length === 0) && booking.meta && Object.keys(booking.meta).length > 0 && (
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info size={16} className="text-muted-foreground" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(booking.meta).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
