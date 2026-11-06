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
import { Search, ChevronLeft, ChevronRight, Filter, Hotel, MapPin } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useParams, usePathname, useRouter } from "next/navigation";
import { RouterPush } from "@/components/RouterPush";
import { Booking } from "../[user]/page";

// --- Helpers ---
const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- Column Definitions ---
export const columns: ColumnDef<Booking>[] = [
  {
    id: "property",
    header: "Property & Ref",
    accessorFn: (row) => `${row.name} ${row.bookingReference} ${row.city}`,
    cell: ({ row }) => {
      const router = useRouter();
      const booking = row.original;
      const { user, place } = useParams();
      
      
        const ids = Array.isArray(user) ? user[0] : user ?? "";
        const id = usePathname().split('/')[2];

        
        

      return (
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-border cursor-zoom-in shrink-0">
                  <img 
                    src={booking.image} 
                    alt={booking.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="p-1 border-border bg-popover">
                <img 
                  src={booking.image} 
                  alt="Preview" 
                  className="h-[100px] w-[100px] object-cover rounded-md" 
                />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div 
            className="flex flex-col cursor-pointer group"
            onClick={() => RouterPush(router, `${id}/${booking._id}`)}
          >
            <span className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {booking.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
              {booking.bookingReference}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] uppercase font-bold bg-muted/50">
        {row.getValue("serviceType")}
      </Badge>
    ),
  },
  {
    accessorKey: "checkIn",
    header: "Dates",
    cell: ({ row }) => (
      <div className="text-[11px] text-muted-foreground leading-tight">
        <span className="text-foreground font-medium">{formatDate(row.original.checkIn)}</span>
        <br />
        to {formatDate(row.original.checkOut)}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-bold text-sm text-foreground">
        {formatCurrency(row.getValue("totalAmount"))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isConfirmed = status === "confirmed";
      return (
        <Badge 
          className={`font-bold text-[10px] uppercase ${
            isConfirmed 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
            : "bg-orange-500/10 text-orange-600 border-orange-500/20"
          }`}
          variant="outline"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${row.original.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <span className="text-[11px] font-medium capitalize">{row.getValue("paymentStatus")}</span>
      </div>
    ),
  },
];

export function BookingsDataTable({ bookings }: { bookings: Booking[] }) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: bookings,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { columnFilters },
  });

  return (
    <div className="w-full  overflow-hidden">
      <div className="p-4 bg-muted/10 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Bookings</h2>
          <p className="text-xs text-muted-foreground">Monitor property reservations and payments</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search property or Ref ID..."
              value={(table.getColumn("property")?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn("property")?.setFilterValue(e.target.value)}
              className="pl-9 w-full sm:w-[260px] bg-background h-9"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-3.5 w-3.5 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/20 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[10px] uppercase font-black tracking-widest border-border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 border-b border-border">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground italic">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}