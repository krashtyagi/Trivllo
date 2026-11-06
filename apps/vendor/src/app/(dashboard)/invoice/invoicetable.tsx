// components/BookingsDataTable.tsx
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
import { ArrowUpDown, Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { usedownloadInvoice, useGetInvoices } from "./query";
import { MessageModal } from "../(categories)/rooms/_components/RoomsListing";
import { PageSkeleton } from "../(categories)/rooms/_components/details.skeleton";
import { Spinner } from "@/components/ui/spinner";
import { IconRefresh } from "@tabler/icons-react";
import { downloadInvoice } from "./invoice.service";
import TablesLoaders from "@/components/loaders/TablesLoaders";
import DataNotFoundTableComponent from "@/components/dataNotFoundTableComponent";


export type Booking = {
  guestName: string;
  downloadId: string;
  bookingId: string;
  room: string;
  pricePerNight: number;
  duration: number;
  amount: number;
  status: "Paid" | "Unpaid" | "Partial" | "Cancelled";
};
type ResponseBooking = {
  bookingId: string,
  bookingReference: string;
  guestName: string;
  room: string;
  pricePerNight: number;
  nights: number;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed";
};


const StatusBadge = React.memo(({ status }: { status: string }) => {
  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    Paid: { variant: "default", label: "Paid" },
    Unpaid: { variant: "destructive", label: "Unpaid" },
    Partial: { variant: "secondary", label: "Partial" },
    Cancelled: { variant: "outline", label: "Cancelled" },
  };

  const style = variants[status] ?? {
    variant: "outline" as const,
    label: status,
  };

  return (
    <Badge variant={style.variant} className="min-w-[70px] justify-center">
      {style.label}
    </Badge>
  );
});


export const columns: ColumnDef<Booking>[] = [
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
    accessorKey: "bookingId",
    header: "Booking ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm text-muted-foreground">
        {row.getValue("bookingId")}
      </div>
    ),
  },
  {
    accessorKey: "room",
    header: "Room",
  },
  {
    accessorKey: "pricePerNight",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-end w-full"
      >
        Price (per night)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("pricePerNight"));
      return <div className="text-center">${price}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Duration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const nights = row.getValue("duration") as number;
      return (
        <div>
          {nights} night{nights !== 1 ? "s" : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="justify-end w-full"
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return <div className="text-center font-medium">${amount}</div>;
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <div className="flex justify-center">
  //       <StatusBadge status={row.getValue("status")} />
  //     </div>
  //   ),
  // },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Action</div>,
    cell: ({ row, table }) => {
      const booking = row.original;
      // We retrieve the custom function from table meta
      const meta = table.options.meta as {
        onDownload: (id: string) => void;
      };

      return (
        <div className="flex items-center justify-end gap-2 pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => meta?.onDownload(booking.downloadId)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export function InvoiceTbale() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const { data, isLoading, refetch, isRefetching } = useGetInvoices();
  const t = data?.data;

  const rawdata: Booking[] = React.useMemo(() => {
    return t?.data?.map((item: ResponseBooking) => ({
      guestName: item.guestName,
      bookingId: item.bookingReference,
      downloadId: item.bookingId,
      room: item.room,
      pricePerNight: item.pricePerNight,
      duration: item.nights,
      amount: item.nights * item.pricePerNight,
      status: item.paymentStatus === "paid" ? "Paid"
        : item.paymentStatus === "pending" ? "Unpaid"
          : item.paymentStatus === "failed" ? "Cancelled"
            : "Unpaid",
    }));
  }, [t]);
  const tableData = rawdata || [] as Booking[];

  // 1. The Download Logic
  const handleDownload = (id: string) => {
    try {
      const res = downloadInvoice(id)

    } catch (error) {
      console.error("Download failed", error);
    }
  };



  const table = useReactTable({
    data: tableData,
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
    meta: {
      onDownload: handleDownload,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* <Button
            variant="outline"
            className="justify-start text-left font-normal w-[240px]"
          >
            5 June - 16 June 2028
          </Button>

          <Button variant="outline" className="w-[180px] justify-between">
            All Status
            <span className="ml-2">▼</span>
          </Button> */}
          <Button variant="outline" className="w-[120px] justify-between" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? <IconRefresh className="animate-spin " /> : <IconRefresh />}
            {
              isRefetching ? "Refreshing..." : "Refresh"
            }

          </Button>
        </div>

        <Input
          placeholder="Search name, room, etc..."
          value={
            (table.getColumn("guestName")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("guestName")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody >

            <TablesLoaders loading={isLoading} rows={10} columns={columns.length}>

              {table?.getRowModel().rows?.length && !isLoading ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
          –
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
            table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
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
    </div>
  );
}
