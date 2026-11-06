// datatable.tsx
"use client";

import { useState } from "react";
import { Settings2, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TogglePatchStatus } from "./reservations.service";
import { Skeleton } from "antd";
import { ReservationsRowSkeleton } from "@/components/loaders/tableSkeletons";

export type StayOption = "checkin" | "checkout" | "staying";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { ArrowUpDown, Eye, Pencil } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner"; // your spinner component
import { useUpdateReservationStatus } from "./hook/updateStstus";
import { useResevatiosnData } from "@/services/tanstack.query";
import { useRouter } from "next/navigation";
import TablesLoaders from "@/components/loaders/TablesLoaders";
import DataNotFoundTableComponent from "@/components/dataNotFoundTableComponent";

export type Status = "confirmed" | "checked_in" | "staying" | "checked_out" | "cancelled" | "pending" | string | null;
export type Reservation = {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  roomLabel: string;
  roomNumber: string;
  specialRequest: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  status: Status;
};

// Memoized cells to reduce unnecessary renders
const StatusBadge = React.memo(({ status }: { status: Status }) => {
  const s = (status || "").toLowerCase();
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let label = (status || "—").replace("_", " ").toUpperCase();

  if (s === "confirmed") {
    badgeStyle = "bg-[#E6F6F0] text-[#1DB47D] border-[#1DB47D]/30";
    label = "CONFIRMED";
  } else if (s === "checked_in") {
    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    label = "CHECKED IN";
  } else if (s === "staying") {
    badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
    label = "STAYING";
  } else if (s === "checked_out") {
    badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
    label = "CHECKED OUT";
  } else if (s === "cancelled") {
    badgeStyle = "bg-[#FEECEC] text-[#EB5757] border-[#EB5757]/30";
    label = "CANCELLED";
  } else if (s === "pending") {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    label = "PENDING";
  }

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold border ${badgeStyle}`}
    >
      {label}
    </span>
  );
});

const ActionCell = React.memo(({ row }: { row: any }) => {
  const status = row.original.status;
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400 hover:text-slate-700"
        onClick={() =>
          router.push(`/reservation/user/${row.original.bookingId}`)
        }
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <OptionSelectionDialog
        id={row.original.bookingId}
        currentStatus={row.original.status}
        guestName={row.original.guestName}
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-700"
            title="Update stay status"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
});

export const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "guestName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Guest <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <div className="flex flex-col py-1">
          <span className="font-medium text-slate-900 dark:text-slate-200">
            <a
              className="cursor-pointer text-text"
              onClick={() =>
                router.push(`/reservation/user/${row.original.bookingId}`)
              }
            >
              {row.original.guestName}
            </a>
          </span>
          <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
            {row.original.bookingReference}
          </span>
        </div>
      );
    },
  },
  {
    header: "Room",
    cell: ({ row }) => (
      <span className="text-slate-600">
        {row.original.roomLabel} {row.original.roomNumber || "23"}
      </span>
    ),
  },
  {
    header: "Request",
    cell: ({ row }) => (
      <span className="text-slate-600 line-clamp-1 max-w-[180px]">
        {row.original.specialRequest || "NA"}
      </span>
    ),
  },
  {
    header: "Duration",
    cell: ({ row }) => {
      const nights = row.original.nights ?? 0;
      return `${nights} night${nights !== 1 ? "s" : ""}`;
    },
  },
  {
    header: "Check-In – Check-Out",
    cell: ({ row }) => {
      const inDate = row.original.checkIn
        ? new Date(row.original.checkIn).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—";
      const outDate = row.original.checkOut
        ? new Date(row.original.checkOut).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "—";
      return (
        <span className="text-slate-600 whitespace-nowrap">
          {inDate} – {outDate}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

export function GuestDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const { data: queryResult, isLoading } = useResevatiosnData();
  const reservations = queryResult?.data ?? [];
  // [{
  //             "bookingReference": "BK-F1EBA5D09A5F",
  //             "guestName": "Mohit Rajput",
  //             "roomLabel": "Luxury Palace Room ",
  //             "specialRequest": null,
  //             "nights": 2,
  //             "checkIn": "2026-03-09T00:00:00.000Z",
  //             "checkOut": "2026-03-11T00:00:00.000Z",
  //             "status": "confirmed"
  //         },
  //         {
  //             "bookingReference": "BK-0C18D3DCA4A7",
  //             "guestName": "Mohit Rajput",
  //             "roomLabel": "Deluxe City View ",
  //             "specialRequest": null,
  //             "nights": 1,
  //             "checkIn": "2026-03-31T00:00:00.000Z",
  //             "checkOut": "2026-04-01T00:00:00.000Z",
  //             "status": "confirmed"
  //         }]
  const table = useReactTable({
    data: reservations,
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
    <div className="w-full space-y-4 p-2">
      <div className="flex items-center justify-end gap-4">
        <Input
          placeholder="Filter guests, request, room..."
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
            <Button variant="outline">
              Columns <span className="ml-2">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md ">
        <Table>
          <TableHeader>
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

          <TableBody>
            <TablesLoaders
              loading={isLoading}
              rows={10}
              columns={columns.length}
            >
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                <DataNotFoundTableComponent
                  columns={columns.length}
                  isLoading={isLoading}
                  table={table}
                />
              )}
            </TablesLoaders>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
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
  );
}

export function OptionSelectionDialog({
  trigger,
  id,
  currentStatus,
  guestName,
}: {
  trigger: React.ReactNode;
  id: string;
  currentStatus?: string;
  guestName?: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getInitialOption = (status?: string): StayOption => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return "checkin";
    if (s === "checked_in") return "staying";
    if (s === "staying") return "checkout";
    if (s === "checked_out") return "checkout";
    return "checkin";
  };

  const [selectedValue, setSelectedValue] = useState<StayOption>(() =>
    getInitialOption(currentStatus),
  );
  const [earlyCheckoutWarning, setEarlyCheckoutWarning] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelectedValue(getInitialOption(currentStatus));
      setEarlyCheckoutWarning(null);
    }
  }, [open, currentStatus]);

  const s = (currentStatus || "").toLowerCase();
  const isCheckedOut = s === "checked_out";

  const handleStatusChange = async () => {
    // Prevent accidental redundant check-in or invalid requests
    if (selectedValue === "checkin" && (s === "checked_in" || s === "staying")) {
      toast.info("Guest is already checked in.");
      setOpen(false);
      return;
    }

    if (selectedValue === "staying" && s === "staying") {
      toast.info("Guest is already marked as staying.");
      setOpen(false);
      return;
    }

    if (isCheckedOut) {
      toast.error("This guest has already checked out.");
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const action =
        TogglePatchStatus[selectedValue as keyof typeof TogglePatchStatus];

      if (typeof action === "function") {
        const res = await (action as any)(id, false);
        if (res?.data?.earlyCheckoutWarning) {
          setEarlyCheckoutWarning(res.data.message);
          return;
        }

        const actionLabels: Record<StayOption, string> = {
          checkin: "Checked In",
          staying: "Starts Staying",
          checkout: "Checked Out",
        };

        toast.success(`Status updated to ${actionLabels[selectedValue] || selectedValue}`);
        setEarlyCheckoutWarning(null);
        setOpen(false);

        // Sync all relevant queries across the vendor dashboard and tables
        queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
        queryClient.invalidateQueries({ queryKey: ["user-getDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-getRooms"] });
      } else {
        throw new Error("Invalid selection");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to update status";
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEarlyCheckout = async () => {
    setLoading(true);
    try {
      const res = await TogglePatchStatus.checkout(id, true);
      toast.success(res?.data?.data?.message || res?.data?.message || "Guest checked out early. Room availability restored.");
      setEarlyCheckoutWarning(null);
      setOpen(false);

      // Invalidate queries so dashboard metrics & reservation table refresh
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["user-getDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-getRooms"] });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to process checkout";
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setEarlyCheckoutWarning(null); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-violet-500" />
            Update Stay Status
          </DialogTitle>
          <DialogDescription>
            {guestName ? `Update stay progress for ${guestName}` : "Choose the specific stay category for this room record."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          {/* Current status display */}
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-muted-foreground font-medium">Current Status</span>
            <StatusBadge status={currentStatus || "confirmed"} />
          </div>

          {isCheckedOut ? (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300 text-xs">
              This reservation has completed checkout. The room has been freed up and no further status modifications can be made.
            </div>
          ) : (
            <div className="grid gap-2">
              <Label
                htmlFor="stay-type"
                className="text-xs font-bold uppercase text-muted-foreground"
              >
                Next Action
              </Label>
              <Select
                value={selectedValue}
                onValueChange={(value) => {
                  setSelectedValue(value as StayOption);
                  setEarlyCheckoutWarning(null);
                }}
              >
                <SelectTrigger id="stay-type" className="w-full h-11">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="checkin"
                    disabled={s === "checked_in" || s === "staying"}
                  >
                    Check-In {s === "checked_in" || s === "staying" ? "(Already Checked In)" : ""}
                  </SelectItem>
                  <SelectItem
                    value="staying"
                    disabled={s === "confirmed" || s === "staying"}
                  >
                    Starts Staying {s === "confirmed" ? "(Check in first)" : s === "staying" ? "(Already Staying)" : ""}
                  </SelectItem>
                  <SelectItem
                    value="checkout"
                    disabled={s === "confirmed"}
                  >
                    Check-out {s === "confirmed" ? "(Check in first)" : ""}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {earlyCheckoutWarning && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                Early Checkout Warning
              </div>
              <p className="leading-relaxed">{earlyCheckoutWarning}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 sm:justify-end">
          <Button
            variant="ghost"
            type="button"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setOpen(false);
              setEarlyCheckoutWarning(null);
            }}
          >
            Cancel
          </Button>
          {isCheckedOut ? (
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
          ) : earlyCheckoutWarning ? (
            <Button
              onClick={handleConfirmEarlyCheckout}
              disabled={loading}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white min-w-[140px]"
            >
              {loading ? "Processing..." : "Confirm Checkout"}
            </Button>
          ) : (
            <Button
              onClick={handleStatusChange}
              disabled={loading}
              className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 min-w-[120px]"
            >
              {loading ? "Updating..." : "Save Selection"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
