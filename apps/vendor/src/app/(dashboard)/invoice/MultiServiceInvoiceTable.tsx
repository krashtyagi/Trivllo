"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Compass,
  Bike,
  Car,
  Mountain,
  RefreshCw,
  FileText,
  Loader2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMultiServiceInvoices } from "@/services/multiservice.query";
import { downloadMultiServiceInvoice } from "@/services/multiservice.service";
import { toast } from "sonner";
import TablesLoaders from "@/components/loaders/TablesLoaders";
import DataNotFoundTableComponent from "@/components/dataNotFoundTableComponent";

// Type matching backend multi-service invoice response
export interface MultiServiceInvoice {
  bookingId: string;
  bookingReference: string;
  customerName: string;
  serviceTitle: string;
  serviceType: "adventure" | "cab" | "bike" | "tour";
  serviceDetails: string;
  amount: number;
  paymentStatus: string;
  bookingDate: string;
}

// Helpers
const formatDate = (iso: string) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amt);

const serviceIcons: Record<string, React.ElementType> = {
  adventure: Mountain,
  cab: Car,
  bike: Bike,
  tour: Compass,
};

const paymentBadgeStyles: Record<string, { dot: string; badge: string }> = {
  paid: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200" },
  refunded: { dot: "bg-zinc-500", badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200" },
  pending: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200" },
};

// Download button cell
function DownloadCell({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await downloadMultiServiceInvoice(bookingId);
      if (result.success) {
        toast.success("Invoice downloaded");
      } else {
        toast.error("Download failed");
      }
    } catch {
      toast.error("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-right pr-2">
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[10px] font-semibold gap-1.5 hover:bg-muted"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
        {loading ? "..." : "PDF"}
      </Button>
    </div>
  );
}

// Column definitions
const columns: ColumnDef<MultiServiceInvoice>[] = [
  {
    accessorKey: "bookingReference",
    header: "Invoice / Customer",
    cell: ({ row }) => {
      const name = row.original.customerName || "Guest";
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-lg border border-border shrink-0">
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold rounded-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{name}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <FileText size={10} className="text-muted-foreground" />
              <code className="text-[10px] font-mono text-muted-foreground">
                {row.original.bookingReference}
              </code>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceTitle",
    header: "Service",
    cell: ({ row }) => {
      const Icon = serviceIcons[row.original.serviceType] || Compass;
      return (
        <div className="flex items-center gap-2.5 max-w-[220px]">
          <div className="p-1.5 bg-muted rounded-lg border border-border text-muted-foreground shrink-0">
            <Icon size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">{row.original.serviceTitle}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{row.original.serviceDetails || row.original.serviceType}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "bookingDate",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar size={13} className="shrink-0" />
        <span className="font-medium">{formatDate(row.original.bookingDate)}</span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-sm font-bold text-foreground font-mono">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const ps = (row.original.paymentStatus || "pending").toLowerCase();
      const style = paymentBadgeStyles[ps] || paymentBadgeStyles.pending;
      return (
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 ${style.badge}`}>
            {ps}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="text-right block pr-2">Download</span>,
    cell: ({ row }) => <DownloadCell bookingId={row.original.bookingId} />,
  },
];

export function MultiServiceInvoiceTable() {
  const { data, isLoading, refetch, isRefetching } = useMultiServiceInvoices();

  const invoices: MultiServiceInvoice[] = React.useMemo(() => {
    const raw = data?.data?.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [data]);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: { globalFilter, pagination },
  });

  const total = invoices.length;
  const { pageIndex, pageSize } = pagination;
  const startIdx = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endIdx = Math.min((pageIndex + 1) * pageSize, total);
  const totalPages = table.getPageCount() || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Invoices
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download and track payment invoices for completed bookings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer, reference..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-9 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Rows:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                const s = Number(val);
                table.setPageSize(s);
                setPagination((p) => ({ ...p, pageSize: s, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="w-[68px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map((v) => (
                  <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent border-b">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="h-11 text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-5">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <TablesLoaders loading={isLoading} rows={8} columns={columns.length}>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30 transition-colors border-b">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <DataNotFoundTableComponent columns={columns.length} isLoading={isLoading} table={table} />
                )}
              </TablesLoaders>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{startIdx}</span> to{" "}
            <span className="font-semibold text-foreground">{endIdx}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span> invoices
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, idx) => (
              <Button
                key={idx}
                variant={pageIndex === idx ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(idx)}
                className="h-8 min-w-[32px] px-2"
              >
                {idx + 1}
              </Button>
            ))}
            {totalPages > 5 && <span className="text-xs text-muted-foreground px-1">…</span>}
            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
