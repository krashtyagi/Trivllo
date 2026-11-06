import * as React from "react";
import { type DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { useHotelStore } from "@/store/hotel.store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { PaymentProps } from "@/schema/payment.schema";
import { UseFormReturn } from "react-hook-form";
import { useToursStore } from "@/store/tours.store";
import { useAdventureStore } from "@/store/adventure.store";
import { useBikesStore } from "@/store/bikes.store";
import { useCabsStore } from "@/store/cabs.store";
export function Calendar05({
  dateRange,
  setDateRange,
}: {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}) {
  //   const today = new Date();
  // today.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <Calendar
      disabled={{ before: today }}
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      // Optional: show 1 month on mobile, 2 on desktop for better fit
      numberOfMonths={
        typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2
      }
      className={cn(
        "border-none shadow-none",
        // Mobile: Take up the space you liked
        "w-[85vw] h-auto min-h-[300px]",
        // PC (md): Reset to a standard size
        "md:w-full md:max-w-none md:h-auto",
      )}
      // classNames={{
      //   // Ensures the two months sit side-by-side on PC and stack on mobile
      //   months: "flex flex-col md:flex-row  md:space-x-2 md:space-y-0",
      //   month: "space-y-2",
      //   table: "w-full border-collapse space-y-1",
      //   nav_button_previous: "absolute left-2 top-9 z-30",
      //   nav_button_next: "absolute right-2 top-9 z-30",
      //   head_cell:
      //     "text-muted-foreground rounded-md w-4 font-normal text-[0.8rem]",
      //   cell: "h-9 w-9 text-center text-sm p-0  [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative ",
      //   day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
      // }}
      classNames={{
        // 1. months should be w-full
        months: "flex flex-col md:flex-row md:space-x-4 md:space-y-0 w-full",

        // 2. Each month MUST have flex-1 and w-full to push the tables to the edge
        month: "space-y-4 w-full flex-1",

        // 3. The table itself must be w-full
        table: "w-full border-collapse space-y-1",

        // 4. Ensure the header row and rows take up full width
        head_row: "flex w-full",
        row: "flex w-full mt-2",

        // 5. Change head_cell, cell, and day from fixed width (w-9) to flexible (flex-1)
        head_cell: "text-muted-foreground flex-1 font-normal text-[0.8rem] text-center",
        cell: "flex-1 h-9 text-center text-sm p-0 relative focus-within:relative",
        day: "w-full h-9 p-0 font-normal aria-selected:opacity-100",

        nav_button_previous: "absolute left-2 top-9 z-30",
        nav_button_next: "absolute right-2 top-9 z-30",
      }}
    />
  );
}

export const hooksSupplier = {

  "tours": useToursStore,
  "adventures": useAdventureStore,
  "cabs": useCabsStore,

  "hotels": useHotelStore,
  "bikes": useBikesStore,

}


export default function HotelCalender({ hookname }: { hookname: keyof typeof hooksSupplier }


) {
  const { date, setDate } = hooksSupplier[hookname]();
  const isMobile = useIsMobile({ breakpoint: 540 })
  // const isgreterthenSm = 

  return <>
    {isMobile && <RangeCalender_singlepage setDateRange={setDate} dateRange={date} />}
    {!isMobile && <Calendar05 setDateRange={setDate} dateRange={date} />}
  </>;
};








export const RangeCalender_singlepage = ({
  className,
  dateRange,
  setDateRange,
  methods
}: {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  className?: string;
  methods?: UseFormReturn<PaymentProps>
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <Calendar
        mode='range'
        disabled={{ before: today }}
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={setDateRange}
        className={cn('rounded-md', className)}
        classNames={{
          range_start: 'bg-primary/20 dark:bg-primary/10 rounded-l-full',
          range_end: 'bg-primary/20 dark:bg-primary/10 rounded-r-full',
          day_button:
            'data-[range-end=true]:rounded-full! data-[range-start=true]:rounded-full! data-[range-start=true]:bg-primary! data-[range-start=true]:text-primary-foreground! data-[range-start=true]:dark:bg-primary! data-[range-start=true]:group-data-[focused=true]/day:ring-primary/20 data-[range-start=true]:dark:group-data-[focused=true]/day:ring-primary/40 data-[range-end=true]:bg-primary! data-[range-end=true]:text-primary-foreground! data-[range-end=true]:dark:bg-primary! data-[range-end=true]:group-data-[focused=true]/day:ring-primary/20 data-[range-end=true]:dark:group-data-[focused=true]/day:ring-primary/40 data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-primary/20 data-[range-middle=true]:dark:bg-primary/10 hover:rounded-full',
          today:
            'data-[selected=true]:rounded-l-none! rounded-full bg-accent! data-[selected=true]:bg-primary/20! dark:data-[selected=true]:bg-primary/10! [&_button[data-range-middle=true]]:bg-transparent!'
        }}
      />

    </div>
  )
}

