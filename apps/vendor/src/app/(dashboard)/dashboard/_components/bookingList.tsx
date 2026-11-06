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
  VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

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
import { cn } from "@/lib/utils";


export type Booking = {
  bookingReference: string;
  guestName: string;
  room: string;              // e.g. "Deluxe", "Standard", "Suite"
  roomNumber?: string;       // optional – if separate from room type
  checkIn: string;           // ISO string
  checkOut: string;          // ISO string
  status: string;            // "confirmed", "checked-in", "pending", etc.
  duration?: number;         // optional – can be calculated
};

// Helper to format date like "June 19, 2028"
const formatDate = (iso: string): string => {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

// Calculate nights
const getDuration = (checkIn: string, checkOut: string): number => {
  try {
    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffMs  = outDate.getTime() - inDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

// Room type badge colors (approximating your screenshot)
const getRoomTypeVariant = (type: string): string => {
  const lower = type.toLowerCase();
  if (lower.includes("deluxe"))   return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300";
  if (lower.includes("suite"))    return "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300";
  if (lower.includes("standard") || lower.includes("classic")) 
                                  return "bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-300";
  return "bg-gray-100 text-gray-800";
};

// Status badge styling
const getStatusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "checked-in" || s === "checkedin") {
    return <Badge className="bg-purple-600 hover:bg-purple-700 text-white min-w-[90px] justify-center">Checked-In</Badge>;
  }
  if (s === "pending") {
    return <Badge variant="secondary" className="min-w-[90px] justify-center">Pending</Badge>;
  }
  if (s === "confirmed") {
    return <Badge className="bg-green-600 hover:bg-green-700 text-white min-w-[90px] justify-center">Confirmed</Badge>;
  }
  return <Badge variant="outline" className="min-w-[90px] justify-center">{status}</Badge>;
};

const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "bookingReference",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Booking ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm text-muted-foreground">
        {row.getValue("bookingReference")}
      </div>
    ),
  },
  {
    accessorKey: "guestName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Guest Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("guestName")}</div>
    ),
  },
  {
    id: "roomType",
    header: "Room Type",
    cell: ({ row }) => {
      const room = row.original.room || "";
      const [type] = room.split(" "); 
      return (
        <Badge
          variant="outline"
          className={cn(
            "font-medium px-2.5 py-0.5",
            getRoomTypeVariant(type)
          )}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    id: "roomNumber",
    header: "Room Number",
    cell: ({ row }) => {
      const room = row.original.room || "";
      const parts = room.split(" ");
      const number = row.original.roomNumber || (parts.length > 1 ? parts[parts.length - 1] : "—");
      return <div>Room {number}</div>;
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const nights = getDuration(row.original.checkIn, row.original.checkOut);
      return <div>{nights} night{nights !== 1 ? "s" : ""}</div>;
    },
  },
  {
    id: "checkInOut",
    header: "Check-In & Check-Out",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.checkIn)} – {formatDate(row.original.checkOut)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-center">
        {getStatusBadge(row.getValue("status"))}
      </div>
    ),
  },
];



interface BookingsDataTableProps {
  bookings: Booking[];
}

export function BookingsDataTable({ bookings }: BookingsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Header controls – similar to screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl">Booking List</h1>
        <Input
          placeholder="Search guest, status, etc."
          value={(table.getColumn("guestName")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("guestName")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <Button variant="outline" className="w-[160px] justify-between">
          All Status
          <span className="ml-2 text-muted-foreground">▼</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground">
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
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (optional – add if you have many rows) */}
      {bookings.length > 10 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}