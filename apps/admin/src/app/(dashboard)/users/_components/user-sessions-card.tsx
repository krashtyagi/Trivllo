"use client";

import React, { useState } from "react";
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  MonitorSmartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  useUserSessions,
  useRevokeSession,
  useRevokeAllUserSessions,
} from "@/services/session.query";
import { SessionItem } from "@/services/session.service";

interface UserSessionsCardProps {
  userId: string;
  userEmail?: string;
}

export function UserSessionsCard({ userId, userEmail }: UserSessionsCardProps) {
  const { data, isLoading, isFetching, refetch } = useUserSessions(userId);
  const { mutate: revokeOne, isPending: isRevokingOne } = useRevokeSession();
  const { mutate: revokeAll, isPending: isRevokingAll } = useRevokeAllUserSessions();

  const [sessionToRevoke, setSessionToRevoke] = useState<SessionItem | null>(null);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

  const sessions = data?.data?.sessions || [];
  const total = data?.data?.total || 0;

  const handleRevokeSingle = (session: SessionItem) => {
    revokeOne(session.id || session._id, {
      onSuccess: () => {
        toast.success("Device session revoked successfully");
        setSessionToRevoke(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to revoke session");
      },
    });
  };

  const handleRevokeAll = () => {
    revokeAll(userId, {
      onSuccess: (res: any) => {
        toast.success(res?.message || "Signed out from all devices");
        setShowRevokeAllDialog(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to revoke all sessions");
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-primary" />
              Active Devices & Logged-in Sessions
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              {total} {total === 1 ? "device" : "devices"}
            </Badge>
          </div>
          <CardDescription className="text-xs mt-1">
            Track and manage devices currently authenticated to this user account via Better Auth.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs cursor-pointer"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {total > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs font-medium cursor-pointer"
              onClick={() => setShowRevokeAllDialog(true)}
              disabled={isRevokingAll}
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Sign Out Everywhere
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Checking device sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">No active sessions</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This user currently has no active Better Auth sessions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessions.map((session) => (
              <div
                key={session.id || session._id}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted border border-border/50">
                    {getDeviceIcon(session.device.deviceType)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {session.device.os} {session.device.osVersion}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-foreground/80">
                        {session.device.browser} {session.device.browserVersion}
                      </span>
                      {session.device.deviceModel && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {session.device.deviceModel}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Globe className="h-3 w-3" />
                        {session.ipAddress || "127.0.0.1"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Logged in: {formatDate(session.createdAt)}
                      </span>
                      <span>•</span>
                      <span>Last active: {formatDate(session.updatedAt || session.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer self-end sm:self-center"
                  onClick={() => setSessionToRevoke(session)}
                  disabled={isRevokingOne}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Revoke Device
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Revoke Single Session Dialog */}
      <AlertDialog
        open={Boolean(sessionToRevoke)}
        onOpenChange={(open) => !open && setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Device Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out this device (
              <span className="font-semibold text-foreground">
                {sessionToRevoke?.device.os} • {sessionToRevoke?.device.browser}
              </span>
              )? This user will be immediately logged out on that device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingOne}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={isRevokingOne}
              onClick={() => sessionToRevoke && handleRevokeSingle(sessionToRevoke)}
            >
              {isRevokingOne ? "Revoking..." : "Revoke Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Dialog */}
      <AlertDialog
        open={showRevokeAllDialog}
        onOpenChange={setShowRevokeAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Sign Out Everywhere?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will terminate all {total} active sessions across every browser, phone, and computer logged in as{" "}
              <span className="font-semibold text-foreground">
                {userEmail || "this user"}
              </span>
              . They will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevokingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={isRevokingAll}
              onClick={handleRevokeAll}
            >
              {isRevokingAll ? "Terminating..." : "Sign Out All Devices"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
