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
  Star,
  MessageSquare,
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

export interface Review {
  reviewId: string;
  _id?: string;
  userName: string;
  companyType: string;
  companyName: string;
  vendorName: string;
  rating: number;
  comment: string;
  hasReply: boolean;
  isFlagged?: boolean;
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

export const columns: ColumnDef<Review>[] = [
  {
    id: "review",
    header: "Reviewer & Comments",
    accessorFn: (row) => `${row.userName} ${row.comment} ${row.companyName}`,
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="flex flex-col gap-1 min-w-[240px] max-w-[400px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">
              {r.userName}
            </span>
            {r.isFlagged && (
              <Badge variant="destructive" className="h-4 px-1.5 py-0 text-[9px] uppercase tracking-wider">
                Flagged
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            "{r.comment}"
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < rating ? "text-amber-400 fill-amber-400" : "text-muted border-muted fill-muted"
              }`}
            />
          ))}
          <span className="text-xs font-bold text-foreground/80 ml-1">{rating}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "companyName",
    header: "Service & Vendor",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-foreground line-clamp-1">
            {r.companyName}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
            {r.vendorName} · {r.companyType}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "hasReply",
    header: "Vendor Reply",
    cell: ({ row }) => {
      const hasReply = row.getValue("hasReply") as boolean;
      return (
        <Badge
          variant="outline"
          className={`capitalize text-[10px] font-medium ${
            hasReply
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }`}
        >
          {hasReply ? "Replied" : "No Reply"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.getValue("createdAt"))}</span>
    ),
  },
];

interface ReviewTableProps {
  reviews: Review[];
  onSelectReview: (reviewId: string) => void;
  ratingFilter: string;
  onRatingFilterChange: (val: string) => void;
  replyFilter: string;
  onReplyFilterChange: (val: string) => void;
}

export function ReviewDataTable({
  reviews,
  onSelectReview,
  ratingFilter,
  onRatingFilterChange,
  replyFilter,
  onReplyFilterChange,
}: ReviewTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: reviews,
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
            Reviews & Feedback
          </h2>
          <p className="text-xs text-muted-foreground">Monitor and manage property & experience reviews</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground flex items-center justify-center">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="Search reviews..."
              value={(table.getColumn("review")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("review")?.setFilterValue(event.target.value)
              }
              className="pl-9 w-full sm:w-[220px] bg-background border-input h-9"
            />
          </div>
          <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
          <Select value={replyFilter} onValueChange={onReplyFilterChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Reply Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Replies</SelectItem>
              <SelectItem value="true">Replied</SelectItem>
              <SelectItem value="false">No Reply</SelectItem>
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
                  onClick={() => onSelectReview(row.original.reviewId || row.original._id || "")}
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
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} review(s)
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
