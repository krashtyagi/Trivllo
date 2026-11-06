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
  MessageSquare,
  Clock,
  XCircle,
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

export interface Ticket {
  _id: string;
  subject: string;
  status: string;
  bookingReference?: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  lastMessageAt?: string;
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

const formatTime = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
};

export const columns: ColumnDef<Ticket>[] = [
  {
    id: "ticket",
    header: "Ticket",
    accessorFn: (row) => `${row.subject} ${row.userName} ${row.email}`,
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <div className="flex flex-col gap-0.5 min-w-[200px]">
          <span className="font-medium text-foreground text-sm leading-snug line-clamp-1">
            {ticket.subject}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {ticket.userName} · {ticket.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || statusConfig.open;
      return (
        <Badge variant="outline" className={`capitalize font-medium text-[11px] ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "bookingReference",
    header: "Booking Ref",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        {row.getValue("bookingReference") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs text-foreground/80">{formatDate(row.getValue("createdAt"))}</span>
        <span className="text-[10px] text-muted-foreground">{formatTime(row.getValue("createdAt"))}</span>
      </div>
    ),
  },
  {
    accessorKey: "lastMessageAt",
    header: "Last Activity",
    cell: ({ row }) => {
      const val = row.getValue("lastMessageAt") as string;
      if (!val) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground">{formatDate(val)}</span>
        </div>
      );
    },
  },
];

interface TicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function TicketDataTable({
  tickets,
  onSelectTicket,
  statusFilter,
  onStatusFilterChange,
}: TicketTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: tickets,
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
            <MessageSquare className="h-5 w-5 text-primary/70" />
            Support Tickets
          </h2>
          <p className="text-xs text-muted-foreground">Manage customer support requests</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={(table.getColumn("ticket")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("ticket")?.setFilterValue(event.target.value)
              }
              className="pl-9 w-full sm:w-[240px] bg-background border-input h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
                  onClick={() => onSelectTicket(row.original._id)}
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
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} ticket(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
