// "use client"

// import * as React from "react"
// import { Calendar } from "@/components/ui/calendar"
// import { Card, CardContent } from "@/components/ui/card"
// import { addDays } from "date-fns"
// import { type DateRange } from "react-day-picker"
// import { useHotelStore } from "@/store/hotel.store"
// import { UseFormReturn } from "react-hook-form"
// import { PaymentProps } from "@/schema/payment.schema"
// import { useIsMobile } from "@/hooks/use-mobile"
// import { RangeCalender_singlepage } from "@/components/navbar/filter-nav-bar/calander05"

// export function BookingCalender({ className, setDateRange, dateRange, methods }: { className?: string, setDateRange: (dateRange: DateRange | undefined) => void, dateRange: DateRange | undefined, methods?: UseFormReturn<PaymentProps> }) {
//     const isMobile = useIsMobile({
//         breakpoint: 540
//     })
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return (
//         <Card className="mx-auto w-fit p-0 bg-transparent border-none ">
//             <CardContent className="p-0 ">
//                 {isMobile && <RangeCalender_singlepage setDateRange={setDateRange} dateRange={dateRange} className={className} />}
//                 {!isMobile && <Calendar
//                     mode="range"
//                     disabled={{ before: today }}
//                     // defaultMonth={dateRange?.from}
//                     selected={dateRange}
//                     onSelect={(dateRange) => {
//                         setDateRange(dateRange)
//                         methods?.setValue("dates", {
//                             checkin: dateRange?.from?.toISOString() || "",
//                             checkout: dateRange?.to?.toISOString() || ""
//                         })
//                     }}
//                     numberOfMonths={2}
//                     // disabled={(date) =>
//                     //     date > new Date() || date < new Date("1900-01-01")
//                     // }
//                     className="border-none shadow-none flex bg-transparent"
//                 />}
//             </CardContent>
//         </Card>
//     )
// }
// export const HotelCalender = ({ className, methods }: { className?: string, methods?: UseFormReturn<PaymentProps> }) => {
//     const { date, setDate } = useHotelStore()
//     return (
//         <BookingCalender setDateRange={setDate} dateRange={date} className={className} methods={methods} />
//     );
// }
"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { type DateRange } from "react-day-picker"
import { useHotelStore } from "@/store/hotel.store"
import { UseFormReturn } from "react-hook-form"
import { PaymentProps } from "@/schema/payment.schema"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export function BookingCalender({ 
  className, 
  setDateRange, 
  dateRange, 
  methods 
}: { 
  className?: string, 
  setDateRange: (dateRange: DateRange | undefined) => void, 
  dateRange: DateRange | undefined, 
  methods?: UseFormReturn<PaymentProps> 
}) {
    const isMobile = useIsMobile()
    const months = isMobile?1:2;

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return (
        <Card className="mx-auto w-fit p-0 bg-transparent border-none shadow-none">
            <CardContent className="p-0">
               
                    <Calendar
                        mode="range"
                        disabled={{ before: today }}
                        selected={dateRange}
                        onSelect={(range) => {
                            setDateRange(range)
                            methods?.setValue("dates", {
                                checkin: range?.from?.toISOString() || "",
                                checkout: range?.to?.toISOString() || ""
                            })
                        }}
                        numberOfMonths={months}
                        className={cn(
                            "border-none shadow-none bg-transparent",
                            // Force 2 months to stay horizontal NO MATTER the screen size
                            "[&_.rdp-months]:flex [&_.rdp-months]:flex-row [&_.rdp-months]:gap-4",
                            "[&_.rdp-months]:!flex-row",           // stronger override
                            "w-fit" // helps keep it compact
                        )}
                    />
            </CardContent>
        </Card>
    )
}

export const HotelCalender = ({ className, methods }: { 
    className?: string, 
    methods?: UseFormReturn<PaymentProps> 
}) => {
    const { date, setDate } = useHotelStore()
    return (
        <BookingCalender 
            setDateRange={setDate} 
            dateRange={date} 
            className={className} 
            methods={methods} 
        />
    )
}