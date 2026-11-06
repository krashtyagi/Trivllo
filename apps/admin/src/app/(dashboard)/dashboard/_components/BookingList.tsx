"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

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
import { Booking } from "../page";

// --- Logic Helpers ---
const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyles = (status: string) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15";
    case "checked_in":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15";
    case "staying":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/15";
    case "checked_out":
      return "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/15";
    case "completed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15";
    default:
      return "bg-muted text-muted-foreground border-transparent";
  }
};

// --- Column Definitions ---
export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "bookingReference",
    header: "Ref ID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
        {row.getValue("bookingReference")}
      </span>
    ),
  },
  {
    accessorKey: "userName",
    header: "Guest",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("userName")}</div>
    ),
  },
  {
    accessorKey: "propertyName",
    header: "Property",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
        <span className="font-medium text-foreground/90">{row.getValue("propertyName") || "Stay"}</span>
        <br />
        <span className="text-[10px] uppercase opacity-70">{row.original.serviceType || "hotel"}</span>
      </div>
    ),
  },
  {
    accessorKey: "checkIn",
    header: "Check In",
    cell: ({ row }) => {
      const rawDate = row.getValue("checkIn") || (row.original as any).bookingDate || (row.original as any).createdAt;
      return <div className="text-sm text-foreground/80">{formatDate(rawDate as string)}</div>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const raw = row.getValue("totalAmount") ?? (row.original as any).amount ?? 0;
      const num = typeof raw === "number" ? raw : parseFloat(raw);
      const amount = isNaN(num) ? 0 : num;
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="font-bold text-foreground">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "pending";
      const displayStatus = status.replace("_", " ");
      return (
        <Badge variant="outline" className={`capitalize font-medium ${getStatusStyles(status)}`}>
          {displayStatus}
        </Badge>
      );
    },
  },
];

interface BookingsDataTableProps {
  bookings: Booking[];
}

export function BookingsDataTable({ bookings }: BookingsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(""); // Global search state

  const table = useReactTable({
    data: bookings,
    columns,
    // State management
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    // Core and logic models
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    // Set 10 rows per page
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-card-foreground">Booking List</h2>
          <p className="text-xs text-muted-foreground">Review and manage guest stays</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all fields..."
              value={globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="pl-9 w-full sm:w-[260px] bg-background border-input h-9 focus-visible:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2 border-input text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 text-[10px] uppercase tracking-widest font-bold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-muted/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground text-sm italic">
                  No reservations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/10">
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground">{table.getRowModel().rows.length}</span> of{" "}
          <span className="text-foreground">{table.getFilteredRowModel().rows.length}</span> entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-[11px] font-bold text-muted-foreground px-2 uppercase tracking-tighter">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}