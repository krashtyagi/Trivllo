// components/ExpensesDataTable.tsx
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

// ────────────────────────────────────────────────
// Type & Mock Data
// ────────────────────────────────────────────────

export type Expense = {
  id?: string;           // optional – you can add real id if needed
  name: string;
  category: string;
  quantity: number;
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Cancelled"; // extend as needed
};

const mockExpenses: Expense[] = [
  { name: "Housekeeping Supplies", category: "Supplies", quantity: 10, amount: 500, date: "June 1, 2028", status: "Completed" },
  { name: "Electricity Bill", category: "Utilities", quantity: 1, amount: 1000, date: "June 2, 2028", status: "Completed" },
  { name: "Marketing Campaign", category: "Marketing and Advertising", quantity: 1, amount: 2000, date: "June 3, 2028", status: "Completed" },
  { name: "Room Maintenance", category: "Maintenance and Repairs", quantity: 3, amount: 1200, date: "June 4, 2028", status: "Completed" },
  { name: "Staff Salaries", category: "Salaries and Wages", quantity: 20, amount: 15000, date: "June 5, 2028", status: "Completed" },
  { name: "Water Bill", category: "Utilities", quantity: 1, amount: 500, date: "June 6, 2028", status: "Completed" },
  { name: "Event Supplies", category: "Supplies", quantity: 5, amount: 750, date: "June 7, 2028", status: "Completed" },
  { name: "Plumbing Repair", category: "Maintenance and Repairs", quantity: 1, amount: 800, date: "June 8, 2028", status: "Completed" },
  { name: "Internet Service", category: "Utilities", quantity: 1, amount: 300, date: "June 9, 2028", status: "Completed" },
  { name: "Print Advertisements", category: "Marketing and Advertising", quantity: 1, amount: 500, date: "June 10, 2028", status: "Completed" },
  // ... add more rows or fetch from API
];

// ────────────────────────────────────────────────
// Reusable Badge
// ────────────────────────────────────────────────

const StatusBadge = React.memo(({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string; border: string }> = {
    Completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    Pending:   { bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-200" },
    Cancelled: { bg: "bg-red-50",    text: "text-red-700",   border: "border-red-200" },
  };

  const style = variants[status] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-3 py-0.5 text-xs font-medium",
        style.bg,
        style.text,
        style.border,
        "hover:bg-opacity-80"
      )}
    >
      {status}
    </Badge>
  );
});

// ────────────────────────────────────────────────
// Columns
// ────────────────────────────────────────────────

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent"
      >
        Expense
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-text">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="text-slate-600">{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-center"
      >
        Quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-end"
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <div className="text-right font-medium">
          ${amount.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="text-slate-600">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Action</div>,
    cell: () => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export function ExpensesDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Replace with real query later: const { data: expenses = [] } = useExpensesQuery();
  const expenses = mockExpenses;

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Controls: Filter + Column visibility */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter expenses, category..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <span className="ml-2">▼</span>
            </Button>
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
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11">
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
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/60 transition-colors"
                >
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
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
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
    </div>
  );
}