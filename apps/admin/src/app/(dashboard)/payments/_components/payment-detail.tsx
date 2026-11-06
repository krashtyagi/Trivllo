"use client";

import React from "react";
import {
  ArrowLeft,
  IndianRupee,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Building2,
  MapPin,
  Hash,
  Shield,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePaymentDetail } from "../queryes";
import { formatAddress } from "@/lib/utils";

const formatDateTime = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

const statusColors: Record<string, string> = {
  captured: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  created: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  partially_refunded: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  processed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

interface PaymentDetailProps {
  paymentId: string;
  onBack: () => void;
}

export function PaymentDetailView({ paymentId, onBack }: PaymentDetailProps) {
  const { data: res, isLoading } = usePaymentDetail(paymentId);
  const detail = res?.data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20 text-muted-foreground">Payment not found</div>
    );
  }

  const payment = detail.paymentInfo;
  const booking = detail.bookingInfo;
  const user = detail.user;
  const service = detail.service;
  const vendor = detail.vendor;
  const refund = detail.refund;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to payments
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary/70" />
                    Payment Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Transaction {payment?.paymentId}
                  </p>
                </div>
                <Badge variant="outline" className={`capitalize font-medium ${statusColors[payment?.status] || ""}`}>
                  {payment?.status?.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <InfoItem label="Amount Paid" value={formatCurrency(payment?.amountPaid)} icon={IndianRupee} />
                <InfoItem label="Currency" value={payment?.currency || "INR"} icon={CreditCard} />
                <InfoItem label="Payment Method" value={payment?.paymentMethod || "—"} icon={CreditCard} />
                <InfoItem label="Verified" value={payment?.isVerified ? "Yes" : "No"} icon={Shield} />
                <InfoItem label="Created" value={formatDateTime(payment?.createdAt)} icon={Calendar} />
                {payment?.razorpayPaymentId && (
                  <InfoItem label="Razorpay ID" value={payment.razorpayPaymentId} icon={Hash} mono />
                )}
                {payment?.gatewayPaymentId && (
                  <InfoItem label="Gateway ID" value={payment.gatewayPaymentId} icon={Hash} mono />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Info */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/70" />
                Booking Information
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <InfoItem label="Booking Reference" value={booking?.bookingReference || "—"} icon={Hash} mono />
                <InfoItem label="Booking Status" value={booking?.status || "—"} icon={CheckCircle2} badge statusColors={statusColors} />
                <InfoItem label="Total Amount" value={formatCurrency(booking?.totalAmount)} icon={IndianRupee} />
                {booking?.checkIn && <InfoItem label="Check-in" value={formatDateTime(booking.checkIn)} icon={Calendar} />}
                {booking?.checkOut && <InfoItem label="Check-out" value={formatDateTime(booking.checkOut)} icon={Calendar} />}
                {booking?.guests && <InfoItem label="Guests" value={String(booking.guests)} icon={User} />}
                {booking?.bookingDate && <InfoItem label="Booking Date" value={formatDateTime(booking.bookingDate)} icon={Calendar} />}
              </div>
            </CardContent>
          </Card>

          {/* Refund Info */}
          {refund && (refund.refundStatus || refund.refundAmount) && (
            <Card className="border-border">
              <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-violet-500" />
                  Refund Details
                </h3>
              </div>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {refund.refundStatus && (
                    <InfoItem label="Refund Status" value={refund.refundStatus} icon={RotateCcw} badge statusColors={statusColors} />
                  )}
                  {refund.refundAmount != null && (
                    <InfoItem label="Refund Amount" value={formatCurrency(refund.refundAmount)} icon={IndianRupee} />
                  )}
                  {refund.refundPercentage != null && (
                    <InfoItem label="Refund %" value={`${refund.refundPercentage}%`} icon={Hash} />
                  )}
                  {refund.cancellationReason && (
                    <div className="col-span-full">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Cancellation Reason</p>
                      <p className="text-sm text-foreground/80">{refund.cancellationReason}</p>
                    </div>
                  )}
                  {refund.refundedAt && (
                    <InfoItem label="Refunded At" value={formatDateTime(refund.refundedAt)} icon={Calendar} />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="text-sm font-semibold text-foreground">Customer</h4>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><User className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-sm font-medium">{user?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Customer</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-xs">{user?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="text-muted-foreground text-xs font-mono">{user?.phoneNumber || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service */}
          <Card className="border-border">
            <div className="p-4 border-b border-border bg-muted/20">
              <h4 className="text-sm font-semibold text-foreground">Service</h4>
            </div>
            <CardContent className="p-4 space-y-3">
              <Badge variant="outline" className={`capitalize font-medium ${serviceTypeColor(service?.type || detail?.paymentType)}`}>
                {service?.type || detail?.paymentType || "—"}
              </Badge>
              {service?.hotel && (
                <div className="space-y-2 mt-2">
                  <p className="text-sm font-medium">{service.hotel.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {service.hotel.city} {formatAddress(service.hotel.address) && `· ${formatAddress(service.hotel.address)}`}
                  </div>
                </div>
              )}
              {service?.title && (
                <p className="text-sm font-medium">{service.title}</p>
              )}
            </CardContent>
          </Card>

          {/* Vendor */}
          {vendor && (
            <Card className="border-border">
              <div className="p-4 border-b border-border bg-muted/20">
                <h4 className="text-sm font-semibold text-foreground">Vendor</h4>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <p className="text-sm font-medium">{vendor.businessName || "—"}</p>
                    <Badge variant="outline" className={`capitalize text-[10px] mt-1 ${statusColors[vendor.status] || ""}`}>
                      {vendor.status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {vendor.businessEmail && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-muted-foreground text-xs">{vendor.businessEmail}</span>
                    </div>
                  )}
                  {vendor.businessPhone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-muted-foreground text-xs font-mono">{vendor.businessPhone}</span>
                    </div>
                  )}
                  {vendor.city && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="text-muted-foreground text-xs">{vendor.city}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
  mono,
  badge,
  statusColors: sc,
}: {
  label: string;
  value: string;
  icon: any;
  mono?: boolean;
  badge?: boolean;
  statusColors?: Record<string, string>;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3 text-muted-foreground/60" />
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
      </div>
      {badge ? (
        <Badge variant="outline" className={`capitalize font-medium text-[11px] ${sc?.[value] || ""}`}>
          {value?.replace(/_/g, " ")}
        </Badge>
      ) : (
        <p className={`text-sm text-foreground/90 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
      )}
    </div>
  );
}

function serviceTypeColor(type: string) {
  const map: Record<string, string> = {
    hotel: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    adventure: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cab: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    bike: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    tour: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    generic: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  };
  return map[type] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
}
