"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useUser, useUserProfile, useUpdateUserStatus } from "../_calls/queryies";
import { useUserSessions } from "@/services/session.query";
import { BookingsDataTable } from "../_components/allDestinations";
import { UserSessionsCard } from "../_components/user-sessions-card";
import { PageSkeleton } from "@/components/loaders/loader/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  MonitorSmartphone,
  Mail,
  Phone,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Loader2,
} from "lucide-react";
import { RouterPush } from "@/components/RouterPush";
import { toast } from "sonner";

export interface Booking {
  _id: string;
  bookingReference: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "partial";
  createdAt: string;
  serviceType: string;
  name: string;
  city: string;
  image: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const { user: userParam } = useParams();
  const id = Array.isArray(userParam) ? userParam[0] : userParam || "";

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: bookingsData, isLoading: bookingsLoading } = useUser(id);
  const { data: profileData, isLoading: profileLoading } = useUserProfile(id);
  const { data: sessionsData } = useUserSessions(id);
  const { mutate: toggleStatus, isPending: isToggling } = useUpdateUserStatus();

  const user = profileData?.data?.data || bookingsData?.data?.data?.user || null;
  const bookings = bookingsData?.data?.data?.bookings || [];
  const activeSessions = sessionsData?.data?.sessions || [];

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleStatus = () => {
    if (!user) return;
    const nextStatus = !user.isActive;
    toggleStatus(
      { userId: user._id || id, isActive: nextStatus },
      {
        onSuccess: (res: any) => {
          toast.success(res?.data?.message || `User marked as ${nextStatus ? "Active" : "Blocked"}`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update user status");
        },
      }
    );
  };

  if (bookingsLoading && profileLoading) {
    return <PageSkeleton />;
  }

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    "Unnamed User";

  const initials =
    (user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase() +
    (user?.lastName?.[0] || "").toUpperCase();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const role = user?.role || "user";

  return (
    <div className="w-full p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs cursor-pointer hover:bg-muted"
          onClick={() => RouterPush(router, "/users")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Users
        </Button>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant={user.isActive ? "destructive" : "outline"}
              size="sm"
              className={`h-8 px-3 text-xs font-semibold cursor-pointer transition-all ${
                !user.isActive
                  ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500"
                  : ""
              }`}
              disabled={isToggling}
              onClick={handleToggleStatus}
            >
              {isToggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : user.isActive ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  Block Account
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  Unblock Account
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* User Hero Profile Card */}
      <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* User Main Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={user?.avatar} alt={fullName} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${
                    user?.isActive !== false ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  title={user?.isActive !== false ? "Active Account" : "Blocked Account"}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {fullName}
                  </h1>

                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 capitalize ${
                      role === "admin" || role === "super_admin"
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : role === "vendor"
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${
                      user?.isActive !== false
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        user?.isActive !== false
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-rose-500"
                      }`}
                    />
                    {user?.isActive !== false ? "Active" : "Blocked"}
                  </Badge>
                </div>

                {/* Email & Phone Contact Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  {user?.email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(user.email, "email")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer group"
                    >
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{user.email}</span>
                      {copiedField === "email" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  )}

                  {user?.phoneNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(user.phoneNumber, "phone")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer group"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{user.phoneNumber}</span>
                      {copiedField === "phone" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  )}

                  {user?.createdAt && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground px-1">
                      <Clock className="h-3.5 w-3.5" />
                      Joined {formatDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
              <div className="p-3 px-4 rounded-xl bg-card border border-border/80 shadow-xs text-center flex-1 lg:flex-initial min-w-[110px]">
                <p className="text-[11px] font-medium text-muted-foreground">Bookings</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {bookings.length}
                </p>
              </div>

              <div className="p-3 px-4 rounded-xl bg-card border border-border/80 shadow-xs text-center flex-1 lg:flex-initial min-w-[110px]">
                <p className="text-[11px] font-medium text-muted-foreground">Live Devices</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xl font-bold text-emerald-500">
                    {activeSessions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Devices & Sessions and Booking History */}
      <Tabs defaultValue="sessions" className="w-full space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border rounded-lg">
          <TabsTrigger value="sessions" className="gap-2 text-xs">
            <MonitorSmartphone className="h-3.5 w-3.5" />
            Active Devices & Sessions ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Booking History ({bookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Live Devices & Better Auth Sessions */}
        <TabsContent value="sessions" className="mt-4 focus-visible:outline-none">
          <UserSessionsCard userId={id} userEmail={user?.email} />
        </TabsContent>

        {/* Tab 2: Bookings */}
        <TabsContent value="bookings" className="mt-4 focus-visible:outline-none">
          <BookingsDataTable bookings={bookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}