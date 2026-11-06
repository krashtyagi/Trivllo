
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
import { hooksSupplier } from "@/components/navbar/filter-nav-bar/calander05"

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
    const months = isMobile ? 1 : 2;

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

export const HotelCalender = ({ className, methods, hookname }: {
    className?: string,
    methods?: UseFormReturn<PaymentProps>,
    hookname: keyof typeof hooksSupplier
}) => {
    const { date, setDate } = hooksSupplier[hookname]();

    React.useEffect(() => {
        setDate(undefined);
        if (methods) {
            methods.setValue("dates", {
                checkin: "",
                checkout: ""
            });
        }
    }, [setDate, methods]);

    return (
        <BookingCalender
            setDateRange={setDate}
            dateRange={date}
            className={className}
            methods={methods}
        />
    )
}