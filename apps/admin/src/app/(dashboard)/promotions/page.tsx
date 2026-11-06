"use client";

import { axiosApi } from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useMemo, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search, Calendar as CalendarIcon, Mail, Phone, Building, RefreshCw, CheckCircle,
  Clock, Shield, Sparkles, Crown, Award, Loader2, Tag, ChevronDown, TrendingDown,
  Trash2, Edit3, MoreHorizontal, ArrowUpDown, CalendarClock, ArrowDownRight, Check
} from "lucide-react";
import { format, addDays, isPast, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";

const planConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  Boost: { label: "Boost (10%)", icon: Award, color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  Premium: { label: "Premium (15%)", icon: Sparkles, color: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  Elite: { label: "Elite (20%)", icon: Crown, color: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  Admin: { label: "Admin Assigned", icon: Shield, color: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  Direct: { label: "Direct", icon: Shield, color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800" },
};

const rankBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  A: { label: "Rank A — Top Priority", bg: "bg-amber-500/10 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/30", icon: Crown },
  B: { label: "Rank B — High", bg: "bg-blue-500/10 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/30", icon: Sparkles },
  C: { label: "Rank C — Standard", bg: "bg-zinc-500/10 dark:bg-zinc-800/40", text: "text-zinc-700 dark:text-zinc-300", border: "border-zinc-500/30", icon: Award },
};

const statusConfig: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300",
};

export default function PromotionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "rejected">("all");

  // Dialog States
  const [approveTarget, setApproveTarget] = useState<any>(null);
  const [selectedRank, setSelectedRank] = useState<string>("A");
  const [approveDateRange, setApproveDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });

  const [editDurationTarget, setEditDurationTarget] = useState<any>(null);
  const [editDateRange, setEditDateRange] = useState<DateRange | undefined>(undefined);

  const [editRankTarget, setEditRankTarget] = useState<any>(null);
  const [newRank, setNewRank] = useState<string>("A");

  const [removeTarget, setRemoveTarget] = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch Promotions
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const res = await axiosApi.get("/admin/promotions");
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  // 1. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, rank, startDate, endDate }: { id: string; rank: string; startDate?: Date; endDate?: Date }) => {
      const res = await axiosApi.patch(`/admin/promotions/${id}/approve`, { rank, startDate, endDate });
      return res.data;
    },
    onSuccess: (d) => {
      toast.success(d?.message || "Promotion approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setApproveTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve promotion.");
    },
  });

  // 2. Update Rank Mutation
  const updateRankMutation = useMutation({
    mutationFn: async ({ id, rank }: { id: string; rank: string }) => {
      const res = await axiosApi.patch(`/admin/promotions/${id}/rank`, { rank });
      return res.data;
    },
    onSuccess: (d) => {
      toast.success(d?.message || "Rank updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setEditRankTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update rank.");
    },
  });

  // 3. Update Duration Mutation
  const updateDurationMutation = useMutation({
    mutationFn: async ({ id, startDate, endDate }: { id: string; startDate?: Date; endDate?: Date }) => {
      const res = await axiosApi.patch(`/admin/promotions/${id}/duration`, { startDate, endDate });
      return res.data;
    },
    onSuccess: (d) => {
      toast.success(d?.message || "Promotion duration updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setEditDurationTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update duration.");
    },
  });

  // 4. Remove Promotion / Rank Mutation
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosApi.patch(`/admin/promotions/${id}/remove`);
      return res.data;
    },
    onSuccess: (d) => {
      toast.success(d?.message || "Promotion rank removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      setRemoveTarget(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove promotion.");
    },
  });

  // Handle Quick Rank Decrease
  const handleDecreaseRank = (req: any) => {
    const current = req.rankAssigned;
    if (current === "A") {
      updateRankMutation.mutate({ id: req.id, rank: "B" });
    } else if (current === "B") {
      updateRankMutation.mutate({ id: req.id, rank: "C" });
    } else if (current === "C") {
      setRemoveTarget(req);
    }
  };

  const allRequests: any[] = data?.data || [];

  const filtered = useMemo(() => {
    return allRequests.filter((r) => {
      const matchesSearch = !debouncedSearch ||
        r.vendorName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.vendorEmail?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.propertyId?.toLowerCase().includes(debouncedSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "active") {
        return r.status === "approved" && r.rankAssigned;
      }
      if (activeTab === "pending") {
        return r.status === "pending";
      }
      if (activeTab === "rejected") {
        return r.status === "rejected";
      }
      return true;
    });
  }, [allRequests, debouncedSearch, activeTab]);

  const stats = {
    total: allRequests.length,
    active: allRequests.filter((r) => r.status === "approved" && r.rankAssigned).length,
    pending: allRequests.filter((r) => r.status === "pending").length,
    rejected: allRequests.filter((r) => r.status === "rejected").length,
  };

  const formatDate = (iso?: string | Date) => {
    if (!iso) return "N/A";
    try {
      return format(new Date(iso), "dd MMM yyyy");
    } catch {
      return "N/A";
    }
  };

  const getDurationStatus = (endDate?: string | Date) => {
    if (!endDate) return { label: "Ongoing", color: "text-muted-foreground bg-muted" };
    try {
      const end = new Date(endDate);
      if (isPast(end)) {
        return { label: "Expired", color: "text-rose-600 bg-rose-500/10 border-rose-200" };
      }
      const days = differenceInDays(end, new Date());
      if (days <= 5) {
        return { label: `${days}d left`, color: "text-amber-600 bg-amber-500/10 border-amber-200" };
      }
      return { label: `${days}d left`, color: "text-emerald-600 bg-emerald-500/10 border-emerald-200" };
    } catch {
      return { label: "Active", color: "text-muted-foreground bg-muted" };
    }
  };

  return (
    <TooltipProvider>
      <div className="p-2 sm:p-4 md:p-6 w-full space-y-5 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Promotions & Listing Ranks
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              Manage property ranking tiers (A, B, C), duration calendars, and vendor promotion requests.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="self-start sm:self-auto gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${(isLoading || isRefetching) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Listings</p>
                <h3 className="mt-1 text-2xl font-black text-foreground">{isLoading ? "..." : stats.total}</h3>
              </div>
              <div className="p-2.5 bg-muted rounded-xl text-muted-foreground"><Tag className="h-4 w-4" /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Ranked</p>
                <h3 className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{isLoading ? "..." : stats.active}</h3>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl"><Crown className="h-4 w-4" /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Requests</p>
                <h3 className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{isLoading ? "..." : stats.pending}</h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl"><Clock className="h-4 w-4" /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Removed / Inactive</p>
                <h3 className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{isLoading ? "..." : stats.rejected}</h3>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl"><Trash2 className="h-4 w-4" /></div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-muted/20">
            {/* Tabs Filter */}
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-auto h-9">
                <TabsTrigger value="all" className="text-xs">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active ({stats.active})</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs">Removed ({stats.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Input */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor, property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Loading promotions...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-bold uppercase tracking-wider pl-6">Property & Vendor</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Service</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Plan</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Rank Tier</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Promotion Duration</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((req) => {
                    const planInfo = planConfig[req.plan] || planConfig.Direct;
                    const PlanIcon = planInfo.icon;
                    const rankInfo = req.rankAssigned ? rankBadgeConfig[req.rankAssigned] : null;
                    const durationStatus = getDurationStatus(req.endDate);

                    return (
                      <TableRow key={req.id} className="border-border hover:bg-muted/30 transition-colors">
                        {/* Property & Vendor */}
                        <TableCell className="py-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground">{req.companyName || "Untitled Property"}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              {req.vendorName}
                              {req.area && <span className="text-[11px] text-muted-foreground/80">• {req.area}</span>}
                            </span>
                          </div>
                        </TableCell>

                        {/* Service Type */}
                        <TableCell className="py-4">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                            {req.serviceType || "hotel"}
                          </Badge>
                        </TableCell>

                        {/* Plan */}
                        <TableCell className="py-4">
                          <Badge variant="outline" className={`gap-1 font-semibold px-2 py-0.5 text-[10px] ${planInfo.color}`}>
                            <PlanIcon className="h-3 w-3" />
                            {planInfo.label}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <Badge variant="secondary" className={`border-none font-semibold rounded-full capitalize px-2.5 py-0.5 text-[10px] ${statusConfig[req.status] || ""}`}>
                            {req.status}
                          </Badge>
                        </TableCell>

                        {/* Rank Tier */}
                        <TableCell className="py-4">
                          {rankInfo ? (
                            <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 text-xs font-extrabold ${rankInfo.bg} ${rankInfo.text} ${rankInfo.border}`}>
                              <rankInfo.icon className="h-3.5 w-3.5" />
                              Rank {req.rankAssigned}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No Rank</span>
                          )}
                        </TableCell>

                        {/* Duration */}
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{formatDate(req.startDate)} → {formatDate(req.endDate)}</span>
                            </div>
                            <div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${durationStatus.color}`}>
                                {durationStatus.label}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === "pending" ? (
                              <Button
                                size="sm"
                                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 rounded-lg shadow-sm"
                                onClick={() => {
                                  setApproveTarget(req);
                                  setSelectedRank("A");
                                  const today = new Date();
                                  setApproveDateRange({ from: today, to: addDays(today, 30) });
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Approve
                              </Button>
                            ) : req.rankAssigned ? (
                              <>
                                {/* Quick Decrease Rank Button */}
                                {req.rankAssigned !== "C" ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-2.5 text-xs font-semibold gap-1 hover:bg-amber-500/10 hover:text-amber-600"
                                        onClick={() => handleDecreaseRank(req)}
                                        disabled={updateRankMutation.isPending}
                                      >
                                        <TrendingDown className="h-3.5 w-3.5" />
                                        <span className="hidden lg:inline">Decrease</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Decrease rank from {req.rankAssigned} to {req.rankAssigned === "A" ? "B" : "C"}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null}

                                {/* Actions Dropdown */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl border-border shadow-lg">
                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                                      Manage Rank & Duration
                                    </DropdownMenuLabel>

                                    {/* Update Rank Option */}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditRankTarget(req);
                                        setNewRank(req.rankAssigned);
                                      }}
                                      className="text-xs gap-2 cursor-pointer font-medium"
                                    >
                                      <Award className="h-3.5 w-3.5 text-primary" />
                                      Update Rank Tier
                                    </DropdownMenuItem>

                                    {/* Update Duration Option */}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditDurationTarget(req);
                                        const from = req.startDate ? new Date(req.startDate) : new Date();
                                        const to = req.endDate ? new Date(req.endDate) : addDays(from, 30);
                                        setEditDateRange({ from, to });
                                      }}
                                      className="text-xs gap-2 cursor-pointer font-medium"
                                    >
                                      <CalendarClock className="h-3.5 w-3.5 text-primary" />
                                      Edit Duration
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="my-1 border-border" />

                                    {/* Remove Rank Option */}
                                    <DropdownMenuItem
                                      onClick={() => setRemoveTarget(req)}
                                      className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive font-medium"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Remove Rank
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs font-semibold gap-1.5 h-8"
                                onClick={() => {
                                  setEditRankTarget(req);
                                  setNewRank("A");
                                }}
                              >
                                <Award className="h-3.5 w-3.5" /> Assign Rank
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex p-4 rounded-full bg-muted text-muted-foreground mb-3">
                <Tag className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">No promotions found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {debouncedSearch ? `No requests matching "${debouncedSearch}".` : "No promotions available in this category."}
              </p>
            </div>
          )}
        </div>

        {/* 1. APPROVE PROMOTION DIALOG */}
        <AlertDialog open={!!approveTarget} onOpenChange={(open) => { if (!open) setApproveTarget(null); }}>
          <AlertDialogContent className="max-w-lg rounded-2xl border-border bg-card">
            <AlertDialogHeader>
              <div className="flex items-center gap-2.5 text-emerald-600 mb-1">
                <CheckCircle className="h-5 w-5" />
                <AlertDialogTitle className="text-lg font-bold">Approve Promotion</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Approve the <span className="font-semibold text-foreground">{approveTarget?.plan}</span> promotion for{" "}
                <span className="font-semibold text-foreground">{approveTarget?.companyName}</span>. Choose the ranking tier and duration calendar.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 my-2">
              {/* Rank Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Select Rank Tier</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["A", "B", "C"] as const).map((r) => {
                    const isSelected = selectedRank === r;
                    const conf = rankBadgeConfig[r];
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRank(r)}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-border/80"
                        }`}
                      >
                        <p className="text-base font-extrabold text-foreground">Rank {r}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r === "A" ? "Top" : r === "B" ? "High" : "Standard"}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Range Calendar Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Promotion Duration</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left text-xs h-9 gap-2 border-border">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {approveDateRange?.from ? (
                        approveDateRange.to ? (
                          <span>{format(approveDateRange.from, "dd MMM yyyy")} – {format(approveDateRange.to, "dd MMM yyyy")}</span>
                        ) : (
                          <span>From {format(approveDateRange.from, "dd MMM yyyy")}</span>
                        )
                      ) : (
                        <span>Pick duration</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 rounded-2xl border-border bg-background shadow-xl" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={approveDateRange?.from || new Date()}
                      selected={approveDateRange}
                      onSelect={setApproveDateRange}
                      numberOfMonths={2}
                      disabled={(date) => {
                        const yesterday = new Date();
                        yesterday.setHours(0, 0, 0, 0);
                        return date < yesterday;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!selectedRank || approveMutation.isPending}
                onClick={() => {
                  if (approveTarget) {
                    approveMutation.mutate({
                      id: approveTarget.id,
                      rank: selectedRank,
                      startDate: approveDateRange?.from || new Date(),
                      endDate: approveDateRange?.to,
                    });
                  }
                }}
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {approveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                Confirm Approval
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 2. UPDATE RANK DIALOG */}
        <AlertDialog open={!!editRankTarget} onOpenChange={(open) => { if (!open) setEditRankTarget(null); }}>
          <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card">
            <AlertDialogHeader>
              <div className="flex items-center gap-2.5 text-primary mb-1">
                <Award className="h-5 w-5" />
                <AlertDialogTitle className="text-lg font-bold">Update Promotion Rank</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Change ranking tier for <span className="font-semibold text-foreground">{editRankTarget?.companyName}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid grid-cols-3 gap-3 my-3">
              {(["A", "B", "C"] as const).map((r) => {
                const isSelected = newRank === r;
                const conf = rankBadgeConfig[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRank(r)}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-border/80"
                    }`}
                  >
                    <p className="text-lg font-extrabold text-foreground">Rank {r}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r === "A" ? "Top Priority" : r === "B" ? "High" : "Standard"}</p>
                  </button>
                );
              })}
            </div>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!newRank || updateRankMutation.isPending}
                onClick={() => {
                  if (editRankTarget && newRank) {
                    updateRankMutation.mutate({ id: editRankTarget.id, rank: newRank });
                  }
                }}
                className="text-xs font-semibold"
              >
                {updateRankMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Save Rank {newRank}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 3. EDIT DURATION DIALOG (RANGE CALENDAR) */}
        <AlertDialog open={!!editDurationTarget} onOpenChange={(open) => { if (!open) setEditDurationTarget(null); }}>
          <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card">
            <AlertDialogHeader>
              <div className="flex items-center gap-2.5 text-primary mb-1">
                <CalendarClock className="h-5 w-5" />
                <AlertDialogTitle className="text-lg font-bold">Update Promotion Duration</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Adjust active start and end dates for <span className="font-semibold text-foreground">{editDurationTarget?.companyName}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 my-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left text-xs h-10 gap-2 border-border">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {editDateRange?.from ? (
                      editDateRange.to ? (
                        <span>{format(editDateRange.from, "dd MMM yyyy")} – {format(editDateRange.to, "dd MMM yyyy")}</span>
                      ) : (
                        <span>From {format(editDateRange.from, "dd MMM yyyy")}</span>
                      )
                    ) : (
                      <span>Pick date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 rounded-2xl border-border bg-background shadow-xl" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={editDateRange?.from || new Date()}
                    selected={editDateRange}
                    onSelect={setEditDateRange}
                    numberOfMonths={2}
                    disabled={(date) => {
                      const yesterday = new Date();
                      yesterday.setHours(0, 0, 0, 0);
                      return date < yesterday;
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { label: "7 Days", days: 7 },
                  { label: "15 Days", days: 15 },
                  { label: "30 Days", days: 30 },
                  { label: "60 Days", days: 60 },
                  { label: "90 Days", days: 90 },
                ].map((preset) => (
                  <Button
                    key={preset.days}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 text-[11px] px-2 rounded-lg"
                    onClick={() => {
                      const today = new Date();
                      setEditDateRange({ from: today, to: addDays(today, preset.days) });
                    }}
                  >
                    +{preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!editDateRange?.from || updateDurationMutation.isPending}
                onClick={() => {
                  if (editDurationTarget && editDateRange?.from) {
                    updateDurationMutation.mutate({
                      id: editDurationTarget.id,
                      startDate: editDateRange.from,
                      endDate: editDateRange.to,
                    });
                  }
                }}
                className="text-xs font-semibold"
              >
                {updateDurationMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Save Duration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 4. REMOVE PROMOTION / RANK ALERT DIALOG */}
        <AlertDialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
          <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card">
            <AlertDialogHeader>
              <div className="flex items-center gap-2.5 text-destructive mb-1">
                <Trash2 className="h-5 w-5" />
                <AlertDialogTitle className="text-lg font-bold">Remove Promotion Rank</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to remove the rank for <span className="font-semibold text-foreground">{removeTarget?.companyName}</span>?
                The listing priority will revert to the baseline tier (Rank C).
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 mt-2">
              <AlertDialogCancel className="text-xs">Keep Rank</AlertDialogCancel>
              <AlertDialogAction
                disabled={removeMutation.isPending}
                onClick={() => {
                  if (removeTarget) {
                    removeMutation.mutate(removeTarget.id);
                  }
                }}
                className="text-xs font-semibold bg-destructive hover:bg-destructive/90 text-white"
              >
                {removeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Confirm Removal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}