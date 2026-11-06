"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { Calendar, ConfigProvider } from "antd";
import type { Dayjs } from "dayjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetCalender } from "./querys"; // ← your query hook
import { useAuthStore } from "@/stores/auth.store";
import { PageSkeleton } from "../../(categories)/rooms/_components/details.skeleton";
import { deleteCalenderData, updateCalenderData } from "./fetch.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";

interface RoomCalendarData {
  date: string; // "2026-03-01"
  availableRooms: number;
  bookedRooms: number;
  blockedRooms: number;
  price: number;
}

interface CalendarEvent {
  time: string;
  title: string;
  category: "Available" | "Low" | "Booked" | "Blocked";
}

const BigCalender: React.FC<{ selected: string | null }> = ({ selected }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [mounted, setMounted] = useState(false);
  const { hotel } = useAuthStore();
  const [hotelId, setHotelId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("hotelId");
    setHotelId(id);
  }, []);

  const { data, isLoading, isRefetching, refetch } = useGetCalender(selected || "");

  // ← Your real data (example structure you shared)
  const calendarData: RoomCalendarData[] = data?.data?.calendar || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusForDate = (dateStr: string): RoomCalendarData | undefined => {
    return calendarData.find((item) => item.date === dateStr);
  };


  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayData = getStatusForDate(dateStr);

    if (!dayData) {
      return (
        <div className="text-xs text-muted-foreground/70 italic p-1">
          No data
        </div>
      );
    }

    const occupancy = dayData.bookedRooms + dayData.blockedRooms;
    const availabilityText = `Available: ${dayData.availableRooms}`;
    let status: CalendarEvent["category"] = "Available";
    let bgClass =
      "bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300";

    if (dayData.availableRooms === 0) {
      status = "Booked";
      bgClass =
        "bg-rose-500/10 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300";
    } else if (dayData.availableRooms <= 1) {
      status = "Low";
      bgClass =
        "bg-amber-500/10 border-l-4 border-amber-500 text-amber-700 dark:text-amber-300";
    }

    return (
      <div
        className={cn(
          "p-2 rounded-r text-xs h-full flex flex-col justify-between",
          bgClass,
        )}
      >
        <div className="font-semibold">₹{dayData.price.toLocaleString()}</div>

        <div className="mt-1">
          <div className="font-bold text-sm">{availabilityText}</div>
          <div className="text-[10px] opacity-80">{status}</div>
        </div>

        {dayData.blockedRooms > 0 && (
          <div className="text-[10px] text-rose-600/80 mt-1">
            {dayData.blockedRooms} blocked
          </div>
        )}
      </div>
    );
  };

  const disabledDate = (current: Dayjs) => {
    const today = dayjs().startOf('day');
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');

    // Disable if before today OR if NOT in the current month
    const isBeforeToday = current && current < today;
    const isNotInCurrentMonth = current < startOfMonth || current > endOfMonth;

    return isBeforeToday || isNotInCurrentMonth;
  };

  // 2. Updated selection logic
  const handleDateSelect = (date: Dayjs) => {
    const today = dayjs().startOf('day');
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');

    // BLOCK: Before Today
    if (date.isBefore(today)) {
      return; // Do nothing
    }

    // BLOCK: Outside current month
    if (date.isBefore(startOfMonth) || date.isAfter(endOfMonth)) {
      return; // Do nothing
    }

    // If passed checks, open dialog
    setSelectedDate(date);
    setOpen(true);
  };

  if (!mounted) return null;
  // if (isLoading || isRefetching) {
  //   return (
  //     <div className="w-full h-full">
  //       <PageSkeleton />
  //     </div>
  //   );
  // }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "var(--primary)",
          colorBgContainer: "transparent",
          colorText: "var(--foreground)",
          colorBorderSecondary: "var(--border)",
          fontFamily: "inherit",
        },
      }}
    >
      {selectedDate && (
        <UpdateCalendarOverrideDialog
          refatch={() => refetch()}
          roomTypeId={selected}
          date={selectedDate}
          currentData={getStatusForDate(selectedDate.format("YYYY-MM-DD"))}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => { }}
        />
      )}

      <div className="w-full space-y-5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Room Availability
          </h2>
          {/* <div className="flex items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg">
              <Button variant="ghost" size="sm" className="h-7 rounded-md px-4">
                Day
              </Button>
              <Button variant="ghost" size="sm" className="h-7 rounded-md px-4">
                Week
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 rounded-md px-4 shadow-sm"
              >
                Month
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-9">
              Export
            </Button>
          </div> */}
        </div>

        {(isLoading || isRefetching) ? (
          <div className="w-full h-full">
            <PageSkeleton />
          </div>
        ) : <div className="rounded-xl bg-card/40 border overflow-hidden">
          <Calendar
            onSelect={handleDateSelect}
            cellRender={(current, info) =>
              info.type === "date" ? dateCellRender(current) : info.originNode
            }
          />
        </div>}
        <style jsx global>{`
  .ant-picker-calendar-full .ant-picker-panel {
    background: transparent !important;
  }
  .ant-picker-calendar-date {
    border-top: 1px solid hsl(var(--border) / 0.3) !important;
    border-inline-end: 1px solid hsl(var(--border) / 0.3) !important;
    margin: 0 !important;
    padding: 0 !important; /* Removed padding to let the inner div fill the space */
    min-height: 110px;
    transition: none !important; /* Remove transition for instant feel */
  }

  /* --- FIX: STOPS HIGHLIGHT ON HOVER --- */
  .ant-picker-calendar-date:hover {
    background: transparent !important;
  }

  /* --- FIX: STOPS HIGHLIGHT WHEN SELECTED --- */
  .ant-picker-cell-selected .ant-picker-calendar-date {
    background: transparent !important;
  }

  /* --- FIX: STOPS GLOBAL ROW HIGHLIGHT ON HOVER --- */
  .ant-picker-panel tbody tr:hover td {
    background: transparent !important;
  }

  /* Improved Header/Weekday styling */
  .ant-picker-calendar-full .ant-picker-content th {
    background: hsl(var(--muted) / 0.4);
    color: hsl(var(--muted-foreground));
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 12px 0 !important;
    border-bottom: 1px solid hsl(var(--border));
  }

  .ant-picker-calendar-date-value {
    color: hsl(var(--muted-foreground)) !important;
    font-weight: 600;
    font-size: 12px;
    padding: 8px 8px 4px 8px !important;
  }

  .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-calendar-date-value {
    color: hsl(var(--primary)) !important;
    font-weight: 800;
  }
`}</style>


      </div>
    </ConfigProvider>
  );
};

export default BigCalender;

interface UpdateDialogProps {
  roomTypeId: string | null;
  date: Dayjs;
  currentData?: RoomCalendarData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  refatch: () => void;
}

function UpdateCalendarOverrideDialog({
  refatch,

  roomTypeId,
  date,
  currentData,
  open,
  onOpenChange,
  onSuccess,
}: UpdateDialogProps) {
  const [price, setPrice] = useState<number | "">(currentData?.price ?? "");
  const [blocked, setBlocked] = useState<number | "">(
    currentData?.blockedRooms ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dateStr = date.format("YYYY-MM-DD");
  const formattedDate = format(date.toDate(), "PPP");

  const handleUpdate = async () => {
    if (!roomTypeId) {
      toast.error("No room type selected");
      return;
    }
    if (price === "" || isNaN(Number(price))) {
      toast.error("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: dateStr,
        blockedRooms: Number(blocked) || 0,
        priceOverride: Number(price),
      };

      const res = await updateCalenderData(roomTypeId, payload);
      refatch();
      toast.success("Calendar updated");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!roomTypeId) return;
    // if (!confirm("Remove override for this date?")) return;

    setDeleting(true);
    try {
      const res = deleteCalenderData(roomTypeId, {
        date: dateStr,
        blockedRooms: Number(blocked) || 0,
        price: Number(price),
      });
      toast.success("Override removed");
      onOpenChange(false);
      refatch()
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override for {formattedDate}</DialogTitle>
          <DialogDescription>
            Set custom price and/or block rooms for this date only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="e.g. 12000"
              min={0}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blocked">Blocked Rooms</Label>
            <Input
              id="blocked"
              type="number"
              value={blocked}
              onChange={(e) =>
                setBlocked(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="e.g. 2"
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Setting blocked rooms reduces availability immediately.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {currentData && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Removing..." : "Remove Override"}
            </Button>
          )}

          <div className="flex-1" />

          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={saving || deleting}
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleUpdate}
            disabled={saving || deleting}
            className="min-w-24 bg-violet-600 hover:bg-violet-700"
          >
            {saving ? "Saving..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
