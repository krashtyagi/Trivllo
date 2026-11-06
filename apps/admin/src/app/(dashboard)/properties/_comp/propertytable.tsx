'use client'

import * as React from "react";
import {
  ColumnFiltersState,
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
  MapPin,
  Building2,
  Car,
  Bike,
  Compass,
  Tent,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Ban,
  Unlock,
  Trash2,
  Clock,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Property } from "../page";
import { RouterPush } from "@/components/RouterPush";
import { useRouter } from "next/navigation";
import {
  useBlockProperty,
  useUnblockProperty,
  useDeleteProperty,
  useDeletedProperties,
  useCleanAllDeletedProperties,
  useDeleteDeletedPropertyRecord,
} from "../[propId]/queryes";
import { cn } from "@/lib/utils";

// Helper for date
const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getServiceIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "cab":
      return <Car className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    case "bike":
      return <Bike className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    case "tour":
      return <Compass className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    case "adventure":
      return <Tent className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
    case "hotel":
    default:
      return <Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />;
  }
};

// --- Column Definitions ---
export const createColumns = (isBlockedView: boolean = false): ColumnDef<Property>[] => [
  {
    id: "vendorname",
    header: "Vendor / Property",
    accessorFn: (row) => `${row.businessName || row.propertyName || ""} ${row.city || ""} ${row.vendorName || ""} ${row.serviceType || ""}`,
    cell: ({ row }) => {
      const router = useRouter();
      const name = row.original.vendorName || row.original.propertyName || "Unnamed Property";
      return (
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
          onClick={() => RouterPush(router, `/properties/${row.original._id}`)}
        >
          <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
            {getServiceIcon(row.original.serviceType)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-zinc-900 dark:text-zinc-100">
              {name}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[220px]">{row.original.businessName || row.original.city}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceType",
    header: "Category",
    cell: ({ row }) => {
      const type = row.getValue("serviceType") as string;
      return (
        <Badge
          variant="secondary"
          className="capitalize text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60"
        >
          {type || "Hotel"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(row.getValue("submittedAt"))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusClass = () => {
        switch (status) {
          case "approved":
            return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
          case "blocked":
            return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
          case "rejected":
            return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
          default:
            return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
        }
      };

      return (
        <Badge
          variant="outline"
          className={`capitalize text-[10px] font-semibold ${getStatusClass()}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="text-right block pr-2">Manage</span>,
    cell: ({ row }) => <PropertyRowActions property={row.original} isBlockedTab={isBlockedView} />,
  },
];

function PropertyRowActions({ property, isBlockedTab }: { property: Property; isBlockedTab?: boolean }) {
  const router = useRouter();
  const [blockDialogOpen, setBlockDialogOpen] = React.useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState("");

  const blockMutation = useBlockProperty();
  const unblockMutation = useUnblockProperty();
  const deleteMutation = useDeleteProperty();

  const isBlocked = property.status === "blocked";

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync({ id: property._id, reason: blockReason });
      toast.success("Vendor and property blocked successfully");
      setBlockDialogOpen(false);
      setBlockReason("");
    } catch {
      toast.error("Failed to block property");
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockMutation.mutateAsync(property._id);
      toast.success("Vendor and property unblocked successfully");
      setUnblockDialogOpen(false);
    } catch {
      toast.error("Failed to unblock property");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(property._id);
      toast.success("Property moved to deleted history");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete property");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5 pr-2">
        {isBlocked ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            onClick={() => setUnblockDialogOpen(true)}
          >
            <Unlock className="h-3.5 w-3.5 mr-1" />
            Unblock
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => RouterPush(router, `/properties/${property._id}`)}
          >
            View Details
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <DropdownMenuItem onClick={() => RouterPush(router, `/properties/${property._id}`)}>
              <Building2 className="mr-2 h-3.5 w-3.5 text-zinc-500" />
              <span>Full Details</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />

            {isBlocked ? (
              <DropdownMenuItem
                className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 cursor-pointer"
                onClick={() => setUnblockDialogOpen(true)}
              >
                <Unlock className="mr-2 h-3.5 w-3.5" />
                <span>Unblock Property</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30 cursor-pointer"
                onClick={() => setBlockDialogOpen(true)}
              >
                <Ban className="mr-2 h-3.5 w-3.5" />
                <span>Block Property</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              <span>Delete Property</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Ban className="h-5 w-5 text-amber-600" /> Block Property & Vendor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs">
              Blocking this vendor will deactivate their business listings immediately. Their property will no longer appear on frontend search, categories, or home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Reason for blocking (optional):</label>
            <Input
              placeholder="e.g. Terms violation, policy breach"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="text-sm bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={blockMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={blockMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {blockMutation.isPending ? "Blocking..." : "Block Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Unlock className="h-5 w-5 text-emerald-600" /> Unblock Property & Vendor?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs">
              This will restore the property and vendor account to active status, allowing their listings to be visible again on frontend search and pages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unblockMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblock}
              disabled={unblockMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {unblockMutation.isPending ? "Unblocking..." : "Unblock Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Trash2 className="h-5 w-5 text-rose-600" /> Delete Property?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              This removes the property listing, associated rooms/packages, and vendor account. Basic information will be archived in the Deleted History tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Main Properties Data Table Component ──────────────────────────────────
export function PropertiesDataTable({ properties }: { properties: Property[] }) {
  const [activeTab, setActiveTab] = React.useState<"active" | "blocked" | "deleted">("active");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Deleted Data Query & Mutations
  const [deletedSearch, setDeletedSearch] = React.useState("");
  const { data: deletedRes, isLoading: isDeletedLoading } = useDeletedProperties({ search: deletedSearch });
  const cleanAllMutation = useCleanAllDeletedProperties();
  const deleteRecordMutation = useDeleteDeletedPropertyRecord();
  const [cleanDialogOpen, setCleanDialogOpen] = React.useState(false);
  const [singleDeleteId, setSingleDeleteId] = React.useState<string | null>(null);

  const activeProperties = React.useMemo(
    () => properties.filter((p) => p.status !== "blocked"),
    [properties]
  );

  const blockedProperties = React.useMemo(
    () => properties.filter((p) => p.status === "blocked"),
    [properties]
  );

  const deletedItems: any[] = (deletedRes as any)?.data?.items || [];
  const deletedTotal: number = (deletedRes as any)?.data?.total || 0;

  // Selected dataset based on active tab
  const currentDataset = activeTab === "active" ? activeProperties : blockedProperties;
  const currentColumns = React.useMemo(
    () => createColumns(activeTab === "blocked"),
    [activeTab]
  );

  const table = useReactTable({
    data: currentDataset,
    columns: currentColumns,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { columnFilters, pagination },
  });

  const total = currentDataset.length;
  const pageIndex = pagination.pageIndex;
  const pageSize = pagination.pageSize;
  const startIdx = total === 0 ? 0 : pageIndex * pageSize + 1;
  const endIdx = Math.min((pageIndex + 1) * pageSize, total);
  const totalPages = table.getPageCount() || 1;

  const handleCleanAll = async () => {
    try {
      await cleanAllMutation.mutateAsync();
      toast.success("Deleted properties archive cleaned successfully");
      setCleanDialogOpen(false);
    } catch {
      toast.error("Failed to clean deleted history");
    }
  };

  const handleSingleDelete = async () => {
    if (!singleDeleteId) return;
    try {
      await deleteRecordMutation.mutateAsync(singleDeleteId);
      toast.success("Record permanently removed");
      setSingleDeleteId(null);
    } catch {
      toast.error("Failed to remove record");
    }
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Property Directory</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Manage active vendors, review blocked accounts, or view deletion logs</p>
        </div>

        {/* Tab Switcher - Classic neutral controls */}
        <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-300/80 dark:border-zinc-800 text-xs">
          <button
            onClick={() => {
              setActiveTab("active");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "active"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <span>Active Listings</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700/60 font-semibold text-zinc-700 dark:text-zinc-300">
              {activeProperties.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("blocked");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "blocked"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <span className="flex items-center gap-1">
              <Ban className="h-3 w-3 text-zinc-500" />
              Blocked
            </span>
            {blockedProperties.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold border border-rose-500/20">
                {blockedProperties.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("deleted");
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "deleted"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <span className="flex items-center gap-1">
              <Trash2 className="h-3 w-3 text-zinc-500" />
              Deleted History
            </span>
            {deletedTotal > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700/60 font-semibold text-zinc-700 dark:text-zinc-300">
                {deletedTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1 & 2: Active or Blocked Properties Table */}
      {activeTab !== "deleted" && (
        <>
          {/* Search & Rows Toolbar */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder={`Search ${activeTab === "blocked" ? "blocked" : "active"} property or city...`}
                value={(table.getColumn("vendorname")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("vendorname")?.setFilterValue(e.target.value)}
                className="pl-9 h-9 w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Rows:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  const newSize = Number(val);
                  table.setPageSize(newSize);
                  setPagination((prev) => ({ ...prev, pageSize: newSize, pageIndex: 0 }));
                }}
              >
                <SelectTrigger className="w-[68px] h-9 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs">
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

          {/* Table Container */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-11 text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-6">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3.5 px-6">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={currentColumns.length} className="h-36 text-center text-zinc-500 text-xs italic">
                      {activeTab === "blocked"
                        ? "No blocked properties found. All listings are currently active."
                        : "No active properties found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-50/40 dark:bg-zinc-900/20">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{startIdx}</span> to{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{endIdx}</span> of{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{total}</span> properties
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 border-zinc-200 dark:border-zinc-800"
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
                    className="h-8 min-w-[32px] px-2 text-xs"
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
                className="h-8 w-8 border-zinc-200 dark:border-zinc-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Tab 3: Deleted History / Trash Tab */}
      {activeTab === "deleted" && (
        <div>
          {/* Header Action Toolbar with Clean Data */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-zinc-50/20 dark:bg-zinc-900/10">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search deleted properties..."
                value={deletedSearch}
                onChange={(e) => setDeletedSearch(e.target.value)}
                className="pl-9 h-9 w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCleanDialogOpen(true)}
                disabled={deletedItems.length === 0 || cleanAllMutation.isPending}
                className="h-9 text-xs font-semibold text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clean Data
              </Button>
            </div>
          </div>

          {/* Deleted Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/40">
                <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="h-11 text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-6">
                    Property / Vendor
                  </TableHead>
                  <TableHead className="h-11 text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-6">
                    Category
                  </TableHead>
                  <TableHead className="h-11 text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-6">
                    Location
                  </TableHead>
                  <TableHead className="h-11 text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-6">
                    Deleted Date
                  </TableHead>
                  <TableHead className="h-11 text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 px-6 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDeletedLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-zinc-500 text-xs">
                      Loading deleted properties...
                    </TableCell>
                  </TableRow>
                ) : deletedItems.length > 0 ? (
                  deletedItems.map((item: any) => (
                    <TableRow key={item._id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                            {getServiceIcon(item.serviceType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                {item.propertyName || item.businessName || "Unnamed Property"}
                              </span>
                              {item.propertyId && (
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                  #{item.propertyId}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {item.vendorName} {item.vendorEmail ? `• ${item.vendorEmail}` : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <Badge
                          variant="secondary"
                          className="capitalize text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60"
                        >
                          {item.serviceType || "Hotel"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                          <span>{item.city || "N/A"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(item.deletedAt)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSingleDeleteId(item._id)}
                          className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Permanently remove log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-zinc-500 text-xs italic">
                      Trash is clean. No deleted properties in archive.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Deleted Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/40 dark:bg-zinc-900/20 text-xs text-zinc-500">
            <span>Total archived records: {deletedTotal}</span>
            <span className="italic text-[11px] text-zinc-400">Use "Clean Data" to purge archive history</span>
          </div>

          {/* Clean All Data Dialog */}
          <AlertDialog open={cleanDialogOpen} onOpenChange={setCleanDialogOpen}>
            <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <Trash2 className="h-5 w-5 text-rose-600" /> Clean All Deleted Property Data?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                  This will permanently clear all {deletedTotal} archived records from the deleted history log, similar to cleaning trash on a mobile phone. This action cannot be reversed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={cleanAllMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCleanAll}
                  disabled={cleanAllMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  {cleanAllMutation.isPending ? "Cleaning..." : "Clean All Data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Single Delete Record Dialog */}
          <AlertDialog open={!!singleDeleteId} onOpenChange={(open) => !open && setSingleDeleteId(null)}>
            <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-zinc-900 dark:text-zinc-100 text-base">
                  Remove record from history?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 text-xs">
                  This will remove this specific entry permanently from the deleted archive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteRecordMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSingleDelete}
                  disabled={deleteRecordMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  {deleteRecordMutation.isPending ? "Removing..." : "Remove Record"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

    </div>
  );
}