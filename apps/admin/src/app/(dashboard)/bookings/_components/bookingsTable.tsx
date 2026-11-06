"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { 
  Search, 
  MapPin, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Compass,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingSummary } from "../page";
import { useRouter } from "next/navigation";
import { RouterPush } from "@/components/RouterPush";

// Formatting Helpers
const formatDate = (iso: string) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatCurrency = (amt: number) => 
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

// --- Column Definitions ---
export const columns: ColumnDef<BookingSummary>[] = [
  {
    accessorKey: "bookingReference",
    header: "Reference / Guest",
    cell: ({ row }) => {
      const router = useRouter();
      const userName = row.original.userName || "Guest";
      const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity" 
          onClick={() => RouterPush(router, `/bookings/${row.original._id}`)}
        >
          <Avatar className="h-9 w-9 rounded-xl border border-gray-200 dark:border-zinc-800 shrink-0">
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold font-mono">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <code className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded border text-foreground w-fit leading-none mb-1">
              {row.original.bookingReference}
            </code>
            <span className="text-xs font-semibold text-foreground leading-tight">
              {userName}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "service",
    header: "Property / Location",
    accessorFn: (row) => `${row.serviceName} ${row.city}`,
    cell: ({ row }) => {
      const isStay = row.original.serviceType?.toLowerCase()?.includes("stay") || row.original.serviceType?.toLowerCase()?.includes("hotel");
      const Icon = isStay ? Building2 : Compass;

      return (
        <div className="flex items-center gap-2.5 max-w-[240px]">
          <div className="p-1.5 bg-muted/65 rounded-lg border border-border text-muted-foreground shrink-0">
            <Icon size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-foreground leading-tight truncate">
              {row.original.serviceName}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
              <MapPin size={10} className="shrink-0" />
              {row.original.city}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "checkIn",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-xs">
        <div className="flex items-center gap-1.5 text-foreground">
          <span className="text-[9px] text-muted-foreground font-black uppercase w-7 tracking-wider">In</span>
          <span className="font-medium">{formatDate(row.original.checkIn)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-[9px] text-muted-foreground/60 font-black uppercase w-7 tracking-wider">Out</span>
          <span className="font-medium">{formatDate(row.original.checkOut)}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Price / Payment",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus || "pending";
      const statusConfig: Record<string, { label: string; text: string; dot: string }> = {
        paid: { label: "Paid", text: "text-emerald-700 dark:text-emerald-450 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
        pending: { label: "Pending", text: "text-amber-700 dark:text-amber-450 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
        refunded: { label: "Refunded", text: "text-zinc-550 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20", dot: "bg-zinc-500" },
      };
      const cfg = statusConfig[paymentStatus] || statusConfig.pending;

      return (
        <div className="flex flex-col">
          <span className="font-extrabold text-sm text-foreground font-mono">{formatCurrency(row.original.totalAmount)}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />
            <Badge variant="outline" className={`font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded border-none ${cfg.text}`}>
              {cfg.label}
            </Badge>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusStyles: Record<string, { dot: string; badge: string }> = {
        ongoing: { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200" },
        upcoming: { dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200" },
        completed: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200" },
        cancelled: { dot: "bg-rose-500", badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200" },
      };
      const style = statusStyles[status] || { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-700 border-amber-200" };

      return (
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <Badge variant="outline" className={`font-bold text-[9px] uppercase px-2 py-0.5 ${style.badge}`}>
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="text-right block pr-4">Action</span>,
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <div className="text-right pr-4">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] font-bold border-gray-250 dark:border-zinc-800 gap-1.5 hover:bg-muted"
            onClick={() => RouterPush(router, `/bookings/${row.original._id}`)}
          >
            <Eye size={12} />
            Details
          </Button>
        </div>
      );
    },
  },
];

export function BookingsDataTable({ bookings }: { bookings: BookingSummary[] }) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: { globalFilter, pagination },
  });

  const total = bookings.length;
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  const startIdx = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endIdx = Math.min((pageIndex + 1) * pageSize, total);
  const totalPages = table.getPageCount() || 1;

  return (
    <div className="w-full rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200/80 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">Reservation Logs</h2>
          <p className="text-xs text-muted-foreground font-medium">Track guest schedules, invoice details, and service logs</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reference, guest, service..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-full bg-background h-10 rounded-lg border-gray-200 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium whitespace-nowrap">
              Rows:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                const newSize = Number(val);
                table.setPageSize(newSize);
                setPagination(prev => ({ ...prev, pageSize: newSize, pageIndex: 0 }));
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
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200/80 dark:border-zinc-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 text-[10px] uppercase font-bold tracking-wider text-gray-750 dark:text-zinc-400 px-6">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 border-b border-gray-200/80 dark:border-zinc-800 group transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground italic">
                  No records found in database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-gray-200/80 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/50 dark:bg-zinc-900/30">
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
          Showing <span className="font-semibold text-gray-900 dark:text-zinc-100">{startIdx}</span> to{" "}
          <span className="font-semibold text-gray-900 dark:text-zinc-100">{endIdx}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-zinc-100">{total}</span> bookings
        </p>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 border-gray-200 dark:border-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <Button
                key={pageNum}
                variant={pageIndex + 1 === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(idx)}
                className="h-8 min-w-[32px] px-2"
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 border-gray-200 dark:border-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}