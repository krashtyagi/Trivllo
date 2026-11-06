"use client";

import React from "react";
import {
  Mail, Phone, Hotel, MapPin, Star, CheckCircle2,
  AlertCircle, MoreHorizontal, Clock, ShieldCheck,
  CreditCard, Hash, Receipt, User,
  Calendar
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookingData } from "./page";
import { formatAddress } from "@/lib/utils";

export default function BookingDetailView({ data }: { data: BookingData }) {
  const { bookingInfo, service, pricing, payment, vendor, user, _id } = data;

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': case 'captured': case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'cancelled': case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-3 bg-background min-h-screen space-y-3">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-muted/30 p-3 rounded-lg border border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight">{bookingInfo.bookingReference}</h1>
            <Badge className={getStatusColor(bookingInfo.status)} variant="outline">
              {bookingInfo.status}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase">Internal ID: {_id}</p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" size="sm" className="h-8 text-xs">Cancel Booking</Button> */}
          {/* <Button size="sm" className="h-8 text-xs bg-primary">Download Invoice</Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

        {/* LEFT COLUMN: Customer & Vendor */}
        <div className="md:col-span-3 space-y-3">
          <Card className="shadow-none border-border">
            <CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Primary Guest</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-1 ring-border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{bookingInfo.primaryGuest.firstName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold leading-none">{bookingInfo.primaryGuest.firstName} {bookingInfo.primaryGuest.lastName}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 lowercase">{bookingInfo.primaryGuest.email}</p>
                </div>
              </div>
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /> {bookingInfo.primaryGuest.phoneNumber}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><User className="h-3 w-3" /> Registered: {user.name}</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Booking User Account</p>
                <div className="grid grid-cols-1 gap-1 text-[10px] bg-muted/50 p-2 rounded">
                  <p className="truncate">Email: {user.email}</p>
                  <p>Phone: {user.phoneNumber}</p>
                  <p className="font-mono text-[9px]">UID: {user._id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border">
            <CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-bold uppercase text-muted-foreground">Vendor Details</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Hotel className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold text-xs">{vendor.businessName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-muted/50 p-1.5 rounded">
                  <p className="text-muted-foreground uppercase">Status</p>
                  <p className="font-bold text-emerald-600">{vendor.status}</p>
                </div>
                <div className="bg-muted/50 p-1.5 rounded">
                  <p className="text-muted-foreground uppercase">Active</p>
                  <p className="font-bold">{vendor.isActive ? "Yes" : "No"}</p>
                </div>
              </div>
              <p className="text-[9px] font-mono text-muted-foreground break-all">VID: {vendor._id}</p>
            </CardContent>
          </Card>
        </div>

        {/* CENTER COLUMN: Booking Detail & Payments */}
        <div className="md:col-span-6 space-y-3">
          <Card className="shadow-none border-border">
            <CardHeader className="p-3 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold">Stay Information</CardTitle>
              </div>
              <p className="text-[10px] text-muted-foreground">Created: {formatDate(bookingInfo.createdAt)}</p>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Check-In</p><p className="text-xs font-bold">{formatDate(bookingInfo.checkIn)}</p></div>
                <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Check-Out</p><p className="text-xs font-bold">{formatDate(bookingInfo.checkOut)}</p></div>
                <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Nights</p><p className="text-xs font-bold">{bookingInfo.nights}</p></div>
                <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Guests</p><p className="text-xs font-bold">{bookingInfo.guests.adults}A, {bookingInfo.guests.children}C</p></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-2 flex flex-col justify-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Room Number</p>
                  <p className="text-xs font-bold">{bookingInfo.roomNumber || "Pending Assignment"}</p>
                </div>
                <div className="border rounded-lg p-2 flex flex-col justify-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Room Type ID</p>
                  <p className="text-[10px] font-mono truncate">{service.room.roomTypeId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="shadow-none border-border">
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Pricing Breakdown</CardTitle>
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span>Base Rate ({pricing.roomsBooked} Room)</span><span>₹{pricing.pricePerNight}</span></div>
                <div className="flex justify-between"><span>Duration</span><span>x {pricing.nights} Night(s)</span></div>
                <div className="flex justify-between"><span>Tax & GST</span><span>₹{pricing.taxAmount}</span></div>
                {pricing.cleaningFee > 0 && <div className="flex justify-between"><span>Cleaning Fee</span><span>₹{pricing.cleaningFee}</span></div>}
                <Separator className="my-1" />
                <div className="flex justify-between font-black text-sm text-foreground"><span>Total Paid</span><span>₹{pricing.totalAmount}</span></div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-border overflow-hidden">
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between bg-muted/20">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Payment Info</CardTitle>
                <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600">{payment.status}</Badge>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Method</span><span className="font-bold uppercase">{payment.paymentMethod}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Verified</span><span className="text-emerald-600 font-bold">{payment.isVerified ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Currency</span><span className="font-bold">{payment.currency}</span></div>
                </div>
                <div className="p-1.5 bg-muted/50 rounded font-mono text-[9px] space-y-1 border border-border">
                  <p className="truncate">ORD: {payment.razorpayOrderId}</p>
                  <p className="truncate">PAY: {payment.razorpayPaymentId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Service/Hotel & Refund */}
        <div className="md:col-span-3 space-y-3">
          <Card className="overflow-hidden shadow-none border-border">
            <div className="h-28 w-full relative group">
              <img src={service.hotel.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Hotel" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-[10px] font-bold truncate">{service.hotel.name}</p>
              </div>
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-[9px] uppercase">{service.type}</Badge>
                <div className="flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3 fill-current" /><span className="text-xs font-bold">{service.hotel.rating}</span></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /><span className="text-[10px] leading-tight">{formatAddress(service.hotel.address)}</span></div>
                <div className="flex items-center justify-between pt-1 text-[10px] border-t">
                  <span className="text-muted-foreground">Verification</span>
                  <span className="font-bold text-amber-600 capitalize">{service.hotel.verificationStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border bg-orange-50/30">
            <CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-bold uppercase text-orange-800 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Refund Policy</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2 text-[11px]">
              <div className="flex justify-between italic"><span>Status</span><span className="font-bold">{bookingInfo.refund.refundStatus}</span></div>
              <div className="flex justify-between"><span>Amount</span><span>₹{bookingInfo.refund.refundAmount}</span></div>
              <div className="flex justify-between"><span>Percentage</span><span>{bookingInfo.refund.refundPercentage}%</span></div>
              <div className="mt-2 p-1.5 bg-orange-100/50 rounded text-[10px] text-orange-900 border border-orange-200">
                Payment Refund Status: <strong>{payment.refund.refundStatus}</strong>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}