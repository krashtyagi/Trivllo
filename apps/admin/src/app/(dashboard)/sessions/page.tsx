"use client";

import React, { useState } from "react";
import {
  MonitorSmartphone,
  Laptop,
  Smartphone,
  Tablet,
  Search,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Clock,
  Globe,
  Radio,
  Filter,
  Users,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RouterPush } from "@/components/RouterPush";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAllSessions, useRevokeSession } from "@/services/session.query";
import { SessionItem } from "@/services/session.service";

export default function AdminSessionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [sessionToRevoke, setSessionToRevoke] = useState<SessionItem | null>(null);

  const { data, isLoading, isFetching, refetch } = useAllSessions({
    page,
    limit,
    search: search.trim() || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    deviceType: deviceFilter !== "all" ? deviceFilter : undefined,
  });

  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();

  const sessions = data?.data?.sessions || [];
  const stats = data?.data?.stats;
  const pagination = data?.data?.pagination;

  const handleRevoke = (session: SessionItem) => {
    revokeSession(session.id || session._id, {
      onSuccess: () => {
        toast.success(`Revoked session for ${session.user?.email || "device"}`);
        setSessionToRevoke(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to revoke session");
      },
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-emerald-500" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-purple-500" />;
      case "desktop":
      default:
        return <Laptop className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
      case "super_admin":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "vendor":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Active Devices & Sessions</h1>
            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Better Auth Tracker
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring and security management of all devices logged into Trivllo.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Sessions</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {stats?.totalActiveSessions ?? "—"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {stats?.uniqueUsersCount ?? "—"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Desktop Devices</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {stats?.desktopCount ?? "—"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Laptop className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Mobile & Tablets</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {(stats?.mobileCount ?? 0) + (stats?.tabletCount ?? 0)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user, email, or IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="blog_editor">Blog Editor</SelectItem>
                <SelectItem value="blog_author">Blog Author</SelectItem>
                <SelectItem value="seo_manager">SEO Manager</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Device Filter */}
            <Select
              value={deviceFilter}
              onValueChange={(val) => {
                setDeviceFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>

            {/* Limit Selector */}
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-xs">User</TableHead>
                <TableHead className="font-semibold text-xs">Device & Browser</TableHead>
                <TableHead className="font-semibold text-xs">IP Address</TableHead>
                <TableHead className="font-semibold text-xs">Login Time</TableHead>
                <TableHead className="font-semibold text-xs">Last Active</TableHead>
                <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground text-sm">
                    Loading active sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <MonitorSmartphone className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No active sessions found</p>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">
                        Sessions will appear here as users and vendors log in via Better Auth.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const initials =
                    (session.user?.name || session.user?.email || "U")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                  return (
                    <TableRow key={session.id || session._id} className="hover:bg-muted/30">
                      {/* User Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={session.user?.avatar} />
                            <AvatarFallback className="text-xs bg-muted font-medium">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">
                                {session.user?.name || "Anonymous User"}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 capitalize ${getRoleBadgeVariant(
                                  session.user?.role
                                )}`}
                              >
                                {session.user?.role || "user"}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {session.user?.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Device & Browser Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-muted/60">
                            {getDeviceIcon(session.device.deviceType)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {session.device.os} {session.device.osVersion}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {session.device.browser} {session.device.browserVersion}
                              {session.device.deviceModel && ` • ${session.device.deviceModel}`}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* IP Address Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{session.ipAddress || "127.0.0.1"}</span>
                        </div>
                      </TableCell>

                      {/* Login Time */}
                      <TableCell className="py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Last Active */}
                      <TableCell className="py-3 text-xs text-muted-foreground">
                        <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                      </TableCell>

                      {/* Action Column */}
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {session.userId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => RouterPush(router, `/users/${session.userId}`)}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              View User
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                            onClick={() => setSessionToRevoke(session)}
                          >
                            <LogOut className="h-3.5 w-3.5 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing {sessions.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(page * limit, pagination?.total ?? sessions.length)} of{" "}
              {pagination?.total ?? sessions.length} sessions
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span>
              Page {page} of {pagination?.pages || pagination?.totalPages || 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              disabled={page >= (pagination?.pages || pagination?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={Boolean(sessionToRevoke)}
        onOpenChange={(open) => !open && setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Device Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately terminate the session on{" "}
              <span className="font-semibold text-foreground">
                {sessionToRevoke?.device.os} ({sessionToRevoke?.device.browser})
              </span>{" "}
              for{" "}
              <span className="font-semibold text-foreground">
                {sessionToRevoke?.user?.email || "this user"}
              </span>
              . The user will be instantly logged out on that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={isRevoking}
              onClick={() => sessionToRevoke && handleRevoke(sessionToRevoke)}
            >
              {isRevoking ? "Revoking..." : "Revoke Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
