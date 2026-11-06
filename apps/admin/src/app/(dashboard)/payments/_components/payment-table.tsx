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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Eye,
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

export interface Payment {
  _id: string;
  paymentId: string;
  bookingId: string;
  bookingReference: string;
  userName: string;
  serviceType: string;
  serviceName: string;
  vendorName: string;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  refundStatus?: string;
  createdAt: string;
}

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusColors: Record<string, string> = {
  captured: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  created: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  partially_refunded: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const serviceColors: Record<string, string> = {
  hotel: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  adventure: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cab: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  bike: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  tour: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

export const columns: ColumnDef<Payment>[] = [
  {
    id: "payment",
    header: "Payment",
    accessorFn: (row) => `${row.userName} ${row.bookingReference} ${row.serviceName}`,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex flex-col gap-0.5 min-w-[180px]">
          <span className="font-medium text-foreground text-sm leading-snug">
            {p.userName}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {p.bookingReference}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceType",
    header: "Service",
    cell: ({ row }) => {
      const type = row.original.serviceType;
      const name = row.original.serviceName;
      const color = serviceColors[type] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className={`capitalize text-[10px] font-semibold w-fit ${color}`}>
            {type}
          </Badge>
          <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[140px]">
            {name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "amountPaid",
    header: "Amount",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 font-semibold text-foreground">
        <IndianRupee className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-sm">{(row.getValue("amountPaid") as number)?.toLocaleString("en-IN")}</span>
      </div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground capitalize">
        {row.getValue("paymentMethod") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const color = statusColors[status] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      return (
        <Badge variant="outline" className={`capitalize font-medium text-[11px] ${color}`}>
          {status?.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "vendorName",
    header: "Vendor",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[120px]">
        {row.getValue("vendorName")}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.getValue("createdAt"))}</span>
    ),
  },
];

interface PaymentTableProps {
  payments: Payment[];
  onSelectPayment: (paymentId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function PaymentDataTable({
  payments,
  onSelectPayment,
  statusFilter,
  onStatusFilterChange,
}: PaymentTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: payments,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-card-foreground flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary/70" />
            All Payments
          </h2>
          <p className="text-xs text-muted-foreground">View and manage all payment transactions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={(table.getColumn("payment")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("payment")?.setFilterValue(event.target.value)
              }
              className="pl-9 w-full sm:w-[240px] bg-background border-input h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="captured">Captured</SelectItem>
              <SelectItem value="created">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-[10px] uppercase font-bold text-muted-foreground">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => onSelectPayment(row.original._id)}
                >
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
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} payment(s)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
