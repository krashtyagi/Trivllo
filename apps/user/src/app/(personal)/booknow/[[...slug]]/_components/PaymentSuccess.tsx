"use client";

import { useRouter } from "next/navigation";
import { downloadBookings } from "./book.service";
import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Home,
  Mail,
  Smartphone,
  User,
  Building,
  CreditCard,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouterPush } from "@/components/RouterPush";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentSuccessProps {
  payment: any;
  serviceData?: any;
}

export function PaymentSuccess({ payment, serviceData }: PaymentSuccessProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatAmount = (amount: number) => {
    if (!amount) return "₹0";
    const value = amount > 10000 ? amount / 100 : amount;
    return value.toLocaleString("en-IN", {
      style: "currency",
      currency: payment?.currency || "INR",
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const handleDownload = async () => {
    const bookingId = payment?.bookingId || payment?._id;
    if (!bookingId) {
      toast.error("Booking ID not found for download.");
      return;
    }
    try {
      setDownloading(true);
      const res = await downloadBookings(bookingId);
      if (res?.success) {
        toast.success("Receipt downloaded successfully!");
      } else {
        toast.error("Failed to download receipt.");
      }
    } catch (error) {
      toast.error("Failed to download receipt.");
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const bookingRef =
    payment?.bookingReference ||
    (payment?.bookingId
      ? `BK-${payment.bookingId.slice(-8).toUpperCase()}`
      : "BK-CONFIRMED");

  const bgImage =
    serviceData?.image || "/tours/tour.png" || "/hotels/rooms_header_bg.jpg";

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto lg:overflow-hidden">
      {/* ── Atmospheric Tour / Hotel Background ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white/90 backdrop-blur-[5px]" />
      </div>

      {/* ── Single-Frame Luxury Voucher Card ── */}
      <div className="relative z-10 w-full max-w-xl md:max-w-2xl bg-white/98 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-300">
        {/* 1. Header Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between gap-3 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                Booking Confirmed!
              </h1>
              <p className="text-xs text-white/85 truncate font-medium">
                {serviceData?.title ? `${serviceData.title} • ` : ""}
                {payment.firstname} {payment.lastname || ""}
              </p>
            </div>
          </div>

          {/* Booking Ref Pill */}
          <button
            onClick={() => copyToClipboard(bookingRef, "Booking Reference")}
            title="Click to copy booking reference"
            className="relative z-10 shrink-0 bg-black/25 hover:bg-black/40 border border-white/25 px-2.5 py-1.5 rounded-xl text-left transition-all active:scale-95 group"
          >
            <div className="text-[9px] uppercase font-bold text-white/70 tracking-wider">
              Booking Ref
            </div>
            <div className="text-xs font-mono font-black text-white flex items-center gap-1">
              <span>{bookingRef}</span>
              {copiedField === "Booking Reference" ? (
                <Check size={11} className="text-emerald-300" />
              ) : (
                <Copy
                  size={11}
                  className="opacity-70 group-hover:opacity-100"
                />
              )}
            </div>
          </button>
        </div>

        {/* 2. Amount & Status Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50/80 dark:bg-zinc-900/40 border-b border-slate-200/60 dark:border-border/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block">
              Total Amount Paid
            </span>
            <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {formatAmount(payment.amount)}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Confirmed & Paid
          </div>
        </div>

        {/* 3. Ticket Notch Divider */}
        <div className="relative flex items-center justify-between my-0.5">
          <div className="-ml-3 w-6 h-6 rounded-full bg-slate-100/95 dark:bg-zinc-900 border-r border-slate-300/80 dark:border-white/10" />
          <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-border/60 mx-1" />
          <div className="-mr-3 w-6 h-6 rounded-full bg-slate-100/95 dark:bg-zinc-900 border-l border-slate-300/80 dark:border-white/10" />
        </div>

        {/* 4. Compact 6-Tile Details Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <InfoTile
            label="Primary Guest"
            value={`${payment.firstname || "Guest"} ${payment.lastname || ""}`.trim()}
            icon={<User size={13} className="text-primary" />}
          />

          <InfoTile
            label="Booking Date"
            value={formatDate(payment.createdAt)}
            icon={<Calendar size={13} className="text-primary" />}
          />

          <InfoTile
            label="Contact Email"
            value={payment.email || "—"}
            icon={<Mail size={13} className="text-primary" />}
            onCopy={() => copyToClipboard(payment.email, "Email")}
            isCopied={copiedField === "Email"}
          />

          <InfoTile
            label="Phone Number"
            value={payment.phone || "—"}
            icon={<Smartphone size={13} className="text-primary" />}
            onCopy={
              payment.phone
                ? () => copyToClipboard(payment.phone, "Phone")
                : undefined
            }
            isCopied={copiedField === "Phone"}
          />

          <InfoTile
            label="Order ID"
            value={payment.razorpay_order_id || "—"}
            icon={<Building size={13} className="text-primary" />}
            mono
            onCopy={
              payment.razorpay_order_id
                ? () => copyToClipboard(payment.razorpay_order_id, "Order ID")
                : undefined
            }
            isCopied={copiedField === "Order ID"}
          />

          <InfoTile
            label="Payment ID"
            value={payment.razorpay_payment_id || "—"}
            icon={<CreditCard size={13} className="text-primary" />}
            mono
            onCopy={
              payment.razorpay_payment_id
                ? () =>
                    copyToClipboard(payment.razorpay_payment_id, "Payment ID")
                : undefined
            }
            isCopied={copiedField === "Payment ID"}
          />
        </div>

        {/* 5. Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-zinc-900/60 border-t border-slate-200/70 dark:border-border/70 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 h-11 sm:h-12 rounded-xl font-bold gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download PDF Receipt
          </Button>

          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              RouterPush(router, "/");
            }}
            className="h-11 sm:h-12 rounded-xl font-semibold gap-2 text-sm sm:px-6 border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted transition-all active:scale-[0.98]"
          >
            <Home size={16} />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon,
  mono,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  mono?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <div
      onClick={onCopy}
      className={cn(
        "p-2.5 sm:p-3 rounded-xl border border-slate-200/80 dark:border-border/60 bg-slate-50/60 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-emerald-500/30 transition-all flex flex-col justify-between group shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        onCopy && "cursor-pointer active:scale-98",
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-muted-foreground truncate">
            {label}
          </span>
        </div>
        {onCopy && (
          <span className="text-slate-400 group-hover:text-emerald-600 transition-colors">
            {isCopied ? (
              <Check size={11} className="text-emerald-500" />
            ) : (
              <Copy size={11} />
            )}
          </span>
        )}
      </div>
      <div
        className={cn(
          "text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground truncate",
          mono && "font-mono text-[11px] sm:text-xs text-slate-600 dark:text-muted-foreground",
        )}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
