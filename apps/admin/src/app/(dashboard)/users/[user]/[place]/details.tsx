"use client";

import React from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Globe,
  CreditCard,
  Hotel,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookingDetail } from "./page";

export default function BookingDetailView({ data }: { data: any }) {
  if (!data) return null;
  const { bookingInfo, service, pricing, payment, vendor } = data;

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const isHotel = data.bookingType === "hotel";

  // Safe guest details
  const guest = bookingInfo?.primaryGuest || (bookingInfo as any)?.primaryCustomer || {};
  const firstName = guest.firstName || guest.name?.split(" ")?.[0] || "Guest";
  const lastName = guest.lastName || guest.name?.split(" ")?.[1] || "";
  const email = guest.email || "N/A";
  const phoneNumber = guest.phoneNumber || guest.phone || "N/A";

  // Safe service details
  const serviceName = isHotel ? (service?.hotel?.name || "Hotel") : ((service as any)?.title || "Service");
  const imageUrl = isHotel
    ? (service?.hotel?.image || "")
    : ((service as any)?.extra?.images?.[0] || "");
  const serviceCity = isHotel ? (service?.hotel?.city || "N/A") : ((service as any)?.meta?.city || "N/A");
  const serviceAddress = isHotel ? (service?.hotel?.address || "N/A") : ((service as any)?.meta?.address || "N/A");
  const rating = isHotel ? (service?.hotel?.rating || 0) : 4.5;
  const numReviews = isHotel ? (service?.hotel?.numReviews || 0) : 12;

  return (
    <div className="p-3 bg-background min-h-screen space-y-3 font-sans antialiased text-zinc-800 dark:text-zinc-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

        {/* LEFT COLUMN: Profile & Vendor */}
        <div className="md:col-span-3 space-y-3">
          {/* Profile Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Profile</CardTitle>
              <MoreHorizontal className="h-4 w-4 text-zinc-400 dark:text-zinc-500 cursor-pointer" />
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="flex flex-col items-center text-center space-y-2.5">
                <Avatar className="h-20 w-20 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl font-bold text-zinc-600 dark:text-zinc-400">
                    {firstName ? firstName[0]?.toUpperCase() : "G"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base capitalize text-zinc-800 dark:text-zinc-200">
                    {firstName} {lastName}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">ID: {bookingInfo?.bookingId?.slice(-8).toUpperCase() || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs font-medium">
                <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400">
                  <Phone className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="font-mono">{phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-400 overflow-hidden">
                  <Mail className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="truncate font-mono">{email}</span>
                </div>
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800/80" />

              <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                <div>
                  <p>Gender</p>
                  <p className="text-zinc-800 dark:text-zinc-200 mt-1 font-semibold">{guest.gender || "MALE"}</p>
                </div>
                <div>
                  <p>Nationality</p>
                  <p className="text-zinc-800 dark:text-zinc-200 mt-1 font-semibold">{guest.nationality || "AMERICAN"}</p>
                </div>
              </div>

              <div className="pt-1">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border border-emerald-500/20 font-bold text-[10px] tracking-wide rounded-full px-2.5 py-0.5">
                  Account Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Vendor</CardTitle>
              <MoreHorizontal className="h-4 w-4 text-zinc-400 dark:text-zinc-500 cursor-pointer" />
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="flex items-center gap-2.5">
                <Hotel className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{vendor?.businessName || "N/A"}</span>
              </div>
              <div className="text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Status:</span>
                  <Badge variant="outline" className="h-5 text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded px-2">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">City:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{serviceCity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER COLUMN: Booking Info & Pricing */}
        <div className="md:col-span-6 space-y-3">
          {/* Main Booking Card */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800 px-6 pt-5">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px] tracking-wide rounded-full px-2.5 py-0.5 inline-flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Booking Confirmed
                  </Badge>
                  <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-zinc-800 dark:text-zinc-200">
                    Booking ID: {bookingInfo?.bookingReference || "N/A"}
                  </CardTitle>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold">{formatDate(bookingInfo?.createdAt)}</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-zinc-400 dark:text-zinc-500 cursor-pointer" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              <div className="grid grid-cols-3 gap-6 mb-6 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Check-In</p>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">{formatDate(bookingInfo?.checkIn || (bookingInfo as any)?.bookingDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Room Number</p>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">{bookingInfo?.roomNumber || "TBA"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Price</p>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">₹{pricing?.pricePerNight || (pricing as any)?.baseAmount || (service as any)?.price || "N/A"} {isHotel ? "/ night" : ""}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Guests</p>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">
                    {bookingInfo?.guests
                      ? `${bookingInfo.guests.adults} Adults, ${bookingInfo.guests.children} Children`
                      : `${(bookingInfo as any)?.participants || (bookingInfo as any)?.quantity || 1} Registered`}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Duration</p>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200">{bookingInfo?.nights !== undefined ? `${bookingInfo.nights} Nights` : ((bookingInfo as any)?.duration ? `${(bookingInfo as any).duration} Hours` : "N/A")}</p>
                </div>
              </div>

              {(!bookingInfo?.refund || bookingInfo.refund.refundStatus === "none") ? (
                <div className="bg-orange-500/5 border border-orange-500/10 dark:bg-orange-500/10 dark:border-orange-500/20 rounded-lg p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-405 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    No Refund Requested
                  </div>
                  <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900 text-orange-700 dark:text-orange-455 border border-orange-500/20 font-bold text-[10px] tracking-wide rounded-full px-2.5">
                    Standard Policy
                  </Badge>
                </div>
              ) : (
                <div className="bg-red-500/5 border border-red-500/10 dark:bg-red-500/10 dark:border-red-500/20 rounded-lg p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-750 dark:text-red-400 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    Refund Requested ({bookingInfo.refund.refundStatus})
                  </div>
                  <Badge variant="outline" className="bg-zinc-50 dark:bg-zinc-900 text-red-750 dark:text-red-450 border border-red-500/20 font-bold text-[10px] tracking-wide rounded-full px-2.5">
                    ₹{bookingInfo.refund.refundAmount}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Payment Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg shadow-sm">
              <CardHeader className="p-5">
                <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5 text-xs font-medium">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>{isHotel ? "Price per night" : "Base Amount"}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{pricing?.pricePerNight || (pricing as any)?.baseAmount || (service as any)?.price || 0}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Tax amount</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{pricing?.taxAmount || 0}</span>
                </div>
                {pricing?.cleaningFee !== undefined && (
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Cleaning Fee</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">₹{pricing.cleaningFee}</span>
                  </div>
                )}
                <Separator className="my-1.5 bg-zinc-200 dark:bg-zinc-800/80" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Total</span>
                  <span className="text-lg font-black font-mono text-zinc-800 dark:text-zinc-200">₹{pricing?.totalAmount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
                <CardTitle className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Payment</CardTitle>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border border-emerald-500/20 font-bold text-[9px] uppercase px-2 py-0.5 rounded">
                  {payment?.status || "Captured"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3.5 px-5 pb-5">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Razorpay Order ID</p>
                  <p className="font-mono text-zinc-800 dark:text-zinc-200 text-xs font-semibold break-all leading-tight">
                    {payment?.razorpayOrderId || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Transaction ID</p>
                  <p className="font-mono text-zinc-800 dark:text-zinc-200 text-xs font-semibold break-all leading-tight">
                    {payment?.razorpayPaymentId || "N/A"}
                  </p>
                </div>
                <div className="pt-1.5">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Pending Admin Approval
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Service Info */}
        <div className="md:col-span-3 space-y-3">
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-card rounded-lg shadow-sm overflow-hidden">
            {imageUrl && (
              <div className="h-48 w-full relative bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                <img
                  src={imageUrl}
                  className="w-full h-full object-cover"
                  alt={serviceName}
                />
              </div>
            )}
            <CardContent className="p-5 space-y-4 text-xs font-medium">
              <div>
                <h3 className="font-bold text-base leading-tight text-zinc-800 dark:text-zinc-200">{serviceName}</h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-zinc-500 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span>{serviceCity}, India</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-orange-400 text-orange-400' : 'text-zinc-350 dark:text-zinc-700'}`} />
                ))}
                <span className="text-xs font-bold ml-1.5 text-zinc-800 dark:text-zinc-200">{rating}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">({numReviews} Reviews)</span>
              </div>

              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-2.5 pt-1.5">
                <div className="flex gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="leading-snug">{serviceAddress}</span>
                </div>
                <div className="flex gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span className="truncate">{vendor?.businessEmail || "omar.faris@oasis-retreats.com"}</span>
                </div>
              </div>

              <Button className="w-full bg-indigo-900 hover:bg-indigo-950 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-zinc-100 dark:text-zinc-200 font-bold h-9 rounded-lg transition-all shadow-sm">
                View Full Booking
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}