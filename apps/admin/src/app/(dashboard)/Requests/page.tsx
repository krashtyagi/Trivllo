"use client";

import { axiosApi } from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
    Search,
    Trash2,
    Calendar,
    Mail,
    Phone,
    Info,
    ShieldAlert,
    Copy,
    Check,
    ChevronLeft,
    ChevronRight,
    UserX,
    Clock,
    RefreshCw,
    AlertTriangle,
    XCircle,
} from "lucide-react";

const CopyButton = ({ value }: { value: string }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success(`Copied to clipboard: ${value}`);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
        </Button>
    );
};

function RequestPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [confirmApproveId, setConfirmApproveId] = React.useState<string | null>(null);
    const [confirmRejectId, setConfirmRejectId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);

        return () => clearTimeout(handler);
    }, [search]);

    const { data, isLoading, isPlaceholderData, refetch, isRefetching } = useQuery({
        queryKey: ["account-delete_requests", debouncedSearch, page, limit],
        queryFn: async () => {
            const res = await axiosApi.get("/admin/account-deactivate/delete-requests", {
                params: {
                    search: debouncedSearch || undefined,
                    page,
                    limit,
                },
            });
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5,
    });

    const approveMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await axiosApi.patch(`/admin/account-deactivate/${userId}/approve-delete`);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Account deletion request approved successfully.");
            queryClient.invalidateQueries({ queryKey: ["account-delete_requests"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to approve account deletion.");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await axiosApi.patch(`/admin/account-deactivate/${userId}/reject-delete`);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Account deletion request rejected successfully.");
            queryClient.invalidateQueries({ queryKey: ["account-delete_requests"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to reject request.");
        },
    });

    const requests = data?.data?.requests || [];
    const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0 };
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    const startIdx = (pagination.page - 1) * pagination.limit + 1;
    const endIdx = Math.min(pagination.page * pagination.limit, pagination.total);

    const selectedApproveRequest = requests.find((r: any) => r._id === confirmApproveId);
    const selectedRejectRequest = requests.find((r: any) => r._id === confirmRejectId);

    const getOldestRequestText = (reqs: any[]) => {
        if (!reqs || reqs.length === 0) return "N/A";
        const dates = reqs
            .map((r) => r.deleteRequest?.requestedAt)
            .filter(Boolean)
            .map((d) => new Date(d).getTime());

        if (dates.length === 0) return "N/A";
        const oldestTime = Math.min(...dates);
        const diffMs = Date.now() - oldestTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
        return "Just now";
    };

    return (
        <TooltipProvider>
            <div className="p-1 sm:p-3 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
                            Account Deletion Requests
                        </h2>
                        <p className="mt-1 text-xs md:text-sm text-gray-500 dark:text-zinc-400 hidden sm:block">
                            Manage and process permanent deactivation requests. Review activity history before approving.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading || isRefetching}
                        className="self-start md:self-auto gap-2 text-xs font-semibold"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${(isLoading || isRefetching) ? "animate-spin" : ""}`} />
                        Refresh Data
                    </Button>
                </div>

                <div className="grid gap-3 md:gap-6 grid-cols-2 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 md:p-6 shadow-sm col-span-2 md:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                                    Pending Requests
                                </p>
                                <h3 className="mt-1 md:mt-2 text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
                                    {isLoading ? "..." : pagination.total}
                                </h3>
                            </div>
                            <div className="p-2 md:p-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-xl">
                                <UserX className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        </div>
                        <div className="mt-2 md:mt-4 flex items-center text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 gap-1.5 font-medium">
                            <ShieldAlert className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            <span>Action required on all requests</span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                                    High Activity
                                </p>
                                <h3 className="mt-1 md:mt-2 text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
                                    {isLoading ? "..." : requests.filter((r: any) => r.totalBookings >= 10).length}
                                </h3>
                            </div>
                            <div className="p-2 md:p-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-xl">
                                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        </div>
                        <div className="mt-2 md:mt-4 flex items-center text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 gap-1.5 font-medium">
                            <Info className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            <span className="hidden sm:inline">Users with 10+ completed bookings</span>
                            <span className="sm:hidden">10+ bookings</span>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                                    Oldest Request
                                </p>
                                <h3 className="mt-1 md:mt-2 text-lg md:text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 truncate">
                                    {isLoading ? "..." : getOldestRequestText(requests)}
                                </h3>
                            </div>
                            <div className="p-2 md:p-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-xl shrink-0 ml-3">
                                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                        </div>
                        <div className="mt-2 md:mt-4 flex items-center text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 gap-1.5 font-medium">
                            <span className="hidden sm:inline">Longest pending request in view</span>
                            <span className="sm:hidden">Longest pending</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
                    <div className="p-3 md:p-5 border-b border-gray-200/80 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 md:gap-4 bg-gray-50/50 dark:bg-zinc-900/30">
                        <div className="relative flex-1 sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                            <Input
                                placeholder="Search by name, email or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 w-full rounded-lg border-gray-200 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium whitespace-nowrap hidden sm:inline">
                                Rows per page:
                            </span>
                            <Select
                                value={limit.toString()}
                                onValueChange={(val) => {
                                    setLimit(Number(val));
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[70px] h-10 border-gray-200 dark:border-zinc-800 dark:bg-zinc-950">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        {isLoading ? (
                            <div className="p-12 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex space-x-4 items-center animate-pulse">
                                        <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                                            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                                        </div>
                                        <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : requests.length > 0 ? (
                            <>
                                <div className="block md:hidden space-y-4 p-4">
                                    {requests.map((req: any) => {
                                        const isHighActivity = req.totalBookings >= 10;
                                        const requestedDate = req.deleteRequest?.requestedAt
                                            ? new Date(req.deleteRequest.requestedAt)
                                            : null;

                                        return (
                                            <div
                                                key={req._id}
                                                className={`bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm transition-all ${isPlaceholderData ? "opacity-50" : ""
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-zinc-850">
                                                            <AvatarImage src={req.avatar} alt={`${req.firstName} ${req.lastName}`} />
                                                            <AvatarFallback className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold">
                                                                {req.firstName?.[0]}
                                                                {req.lastName?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100 leading-tight">
                                                                {req.firstName} {req.lastName}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-550 mt-0.5">
                                                                ID: {req._id?.slice(-8).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-zinc-100 text-zinc-850 dark:bg-zinc-900 dark:text-zinc-300 border-none font-semibold rounded-full capitalize px-2.5 py-0.5 text-[10px]"
                                                    >
                                                        {req.deleteRequest?.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 text-xs text-gray-600 dark:text-zinc-300 bg-gray-50/50 dark:bg-zinc-900/30 p-3 rounded-lg border border-gray-100 dark:border-zinc-900/40">
                                                    <div className="flex items-center justify-between group">
                                                        <div className="flex items-center gap-1.5 min-w-0 mr-2">
                                                            <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                            <span className="truncate block font-medium">{req.email}</span>
                                                        </div>
                                                        <CopyButton value={req.email} />
                                                    </div>
                                                    {req.phoneNumber && (
                                                        <div className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-1.5 min-w-0 mr-2">
                                                                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                                <span className="font-medium">{req.phoneNumber}</span>
                                                            </div>
                                                            <CopyButton value={req.phoneNumber} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center text-xs">
                                                    <div>
                                                        <Badge
                                                            variant="outline"
                                                            className="px-2.5 py-0.5 rounded-full font-semibold bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]"
                                                        >
                                                            {req.totalBookings} Bookings
                                                        </Badge>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1 font-medium">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>
                                                            {requestedDate ? requestedDate.toLocaleString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : "N/A"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {req.deleteRequest?.reason ? (
                                                    <div className="text-xs italic bg-zinc-50 dark:bg-zinc-900/50 text-gray-600 dark:text-zinc-400 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/40">
                                                        <span className="font-semibold not-italic block text-[10px] text-gray-405 dark:text-zinc-500 uppercase tracking-wider mb-1">Reason:</span>
                                                        "{req.deleteRequest.reason}"
                                                    </div>
                                                ) : (
                                                    <div className="text-xs italic text-gray-400 dark:text-zinc-550 bg-zinc-50/30 dark:bg-zinc-900/10 p-3 rounded-lg border border-dashed border-zinc-200/50 dark:border-zinc-800/20">
                                                        No reason provided
                                                    </div>
                                                )}

                                                <div className="flex gap-3 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
                                                        onClick={() => setConfirmRejectId(req._id)}
                                                    >
                                                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                                        Keep Account
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex-1 text-xs bg-red-650 hover:bg-red-700 text-white font-semibold"
                                                        onClick={() => setConfirmApproveId(req._id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-gray-200/80 dark:border-zinc-800 hover:bg-transparent bg-gray-50/50 dark:bg-zinc-900/10">
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4 pl-6">User</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4">Contact Information</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4">Bookings</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4">Reason for Deletion</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4">Status</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4">Requested At</TableHead>
                                                <TableHead className="font-semibold text-gray-700 dark:text-zinc-300 py-4 pr-6 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.map((req: any) => {
                                                const isHighActivity = req.totalBookings >= 10;
                                                const requestedDate = req.deleteRequest?.requestedAt
                                                    ? new Date(req.deleteRequest.requestedAt)
                                                    : null;

                                                return (
                                                    <TableRow
                                                        key={req._id}
                                                        className={`border-b border-gray-200/80 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors ${isPlaceholderData ? "opacity-50" : ""
                                                            }`}
                                                    >
                                                        <TableCell className="py-4 pl-6">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-zinc-800">
                                                                    <AvatarImage src={req.avatar} alt={`${req.firstName} ${req.lastName}`} />
                                                                    <AvatarFallback className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold">
                                                                        {req.firstName?.[0]}
                                                                        {req.lastName?.[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-gray-900 dark:text-zinc-100">
                                                                        {req.firstName} {req.lastName}
                                                                    </span>
                                                                    <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-550">
                                                                        ID: {req._id}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1.5 group">
                                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                                    <span className="text-sm text-gray-600 dark:text-zinc-300">
                                                                        {req.email}
                                                                    </span>
                                                                    <CopyButton value={req.email} />
                                                                </div>
                                                                {req.phoneNumber && (
                                                                    <div className="flex items-center gap-1.5 group">
                                                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                                        <span className="text-sm text-gray-600 dark:text-zinc-300">
                                                                            {req.phoneNumber}
                                                                        </span>
                                                                        <CopyButton value={req.phoneNumber} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="px-2.5 py-0.5 rounded-full font-semibold cursor-help bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                                        >
                                                                            {req.totalBookings} Completed
                                                                        </Badge>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="p-2 text-xs">
                                                                    {isHighActivity
                                                                        ? "Warning: High activity user. Check for outstanding bookings/refunds before deleting."
                                                                        : "Standard activity history."}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TableCell>

                                                        <TableCell className="py-4 max-w-[240px]">
                                                            {req.deleteRequest?.reason ? (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="text-sm text-gray-600 dark:text-zinc-300 block truncate cursor-help italic">
                                                                            "{req.deleteRequest.reason}"
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-[300px] p-3 text-xs bg-zinc-900 text-zinc-100 rounded-lg">
                                                                        <p className="font-semibold mb-1">Reason for request:</p>
                                                                        <p className="italic text-gray-300">"{req.deleteRequest.reason}"</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 dark:text-zinc-500 italic">
                                                                    No reason provided
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-none font-semibold rounded-full capitalize px-2.5 py-0.5"
                                                                >
                                                                    {req.deleteRequest?.status}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm font-medium text-gray-800 dark:text-zinc-300">
                                                                    {requestedDate ? requestedDate.toLocaleDateString(undefined, {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    }) : "N/A"}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {requestedDate ? requestedDate.toLocaleTimeString(undefined, {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    }) : ""}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 pr-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 rounded-lg transition-all"
                                                                            onClick={() => setConfirmRejectId(req._id)}
                                                                        >
                                                                            <XCircle className="h-4.5 w-4.5" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Reject request (keep account active)</TooltipContent>
                                                                </Tooltip>

                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                                                                            onClick={() => setConfirmApproveId(req._id)}
                                                                        >
                                                                            <Trash2 className="h-4.5 w-4.5" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Approve deletion (permanently delete)</TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="inline-flex p-4 rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-400 dark:text-zinc-500 mb-4 ring-8 ring-gray-50/50 dark:ring-zinc-900/30">
                                    <UserX className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-200">No requests found</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {debouncedSearch
                                        ? `No deletion requests matched the search term "${debouncedSearch}".`
                                        : "There are no pending account deletion requests at this time."}
                                </p>
                                {debouncedSearch && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSearch("")}
                                        className="mt-4"
                                    >
                                        Clear Search
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {requests.length > 0 && (
                        <div className="p-3 md:p-5 border-t border-gray-200/80 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 bg-gray-50/50 dark:bg-zinc-900/30">
                            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                                Showing <span className="font-semibold text-gray-900 dark:text-zinc-100">{startIdx}</span> to{" "}
                                <span className="font-semibold text-gray-900 dark:text-zinc-100">{endIdx}</span> of{" "}
                                <span className="font-semibold text-gray-900 dark:text-zinc-100">{pagination.total}</span> requests
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="h-8 w-8 border-gray-200 dark:border-zinc-800"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(pageNum)}
                                            className="h-8 min-w-[32px] px-2"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="h-8 w-8 border-gray-200 dark:border-zinc-800"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialog open={!!confirmApproveId} onOpenChange={(open) => !open && setConfirmApproveId(null)}>
                    <AlertDialogContent className="dark:bg-zinc-950 dark:border-zinc-800">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-3 text-red-600 mb-2">
                                <ShieldAlert className="h-6 w-6" />
                                <AlertDialogTitle className="text-xl font-bold">Permanently Delete Account?</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">
                                You are about to approve the deletion request for{" "}
                                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                                    {selectedApproveRequest?.firstName} {selectedApproveRequest?.lastName}
                                </span>{" "}
                                (<span className="font-mono text-xs text-gray-500 dark:text-zinc-400">{selectedApproveRequest?.email}</span>).
                                <br /><br />
                                This action is <span className="font-bold text-red-600 dark:text-red-400 underline">permanent and cannot be undone</span>.
                                All profile data, settings, and records related to this user will be deleted. Any active bookings will be detached from this account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 gap-2">
                            <AlertDialogCancel className="border-gray-200 dark:border-zinc-800">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (confirmApproveId) {
                                        approveMutation.mutate(confirmApproveId);
                                        setConfirmApproveId(null);
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
                            >
                                Confirm Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={!!confirmRejectId} onOpenChange={(open) => !open && setConfirmRejectId(null)}>
                    <AlertDialogContent className="dark:bg-zinc-950 dark:border-zinc-800">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100 mb-2">
                                <Info className="h-6 w-6 text-blue-500" />
                                <AlertDialogTitle className="text-xl font-bold">Reject Deletion Request</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">
                                Are you sure you want to reject the deletion request for{" "}
                                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                                    {selectedRejectRequest?.firstName} {selectedRejectRequest?.lastName}
                                </span>{" "}
                                (<span className="font-mono text-xs text-gray-500 dark:text-zinc-400">{selectedRejectRequest?.email}</span>)?
                                <br /><br />
                                The deletion request will be cleared and the user account will remain active.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4 gap-2">
                            <AlertDialogCancel className="border-gray-200 dark:border-zinc-800">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (confirmRejectId) {
                                        rejectMutation.mutate(confirmRejectId);
                                        setConfirmRejectId(null);
                                    }
                                }}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold shadow-sm"
                            >
                                Reject Request
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}

export default RequestPage;