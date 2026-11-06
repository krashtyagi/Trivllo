"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PaymentProps } from "@/schema/payment.schema";
import { UseFormReturn } from "react-hook-form";
import { VisitorsMembers } from "@/app/(home)/(categories)/hotels/[hotel]/_components/tabs";
import { HotelCalender } from "@/app/(home)/(categories)/hotels/[hotel]/_components/calander-booking";
export default function DialougeEditDates({ methods, trigger }: { methods: UseFormReturn<PaymentProps>; trigger: string; content: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs font-bold">
                    {trigger}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] md:max-w-[900px] p-0 overflow-hidden">
                <div className="p-6 border-b">
                    <DialogTitle>Update Your Stay</DialogTitle>
                    <DialogDescription>Modify dates or guest count to see updated pricing.</DialogDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-0">
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r">
                        <HotelCalender hookname="hotels" methods={methods} />
                    </div>
                    <div className="flex-1 p-6 bg-muted/20">
                        <VisitorsMembers showCalendar={false} methods={methods} />
                    </div>
                </div>
                <div className="p-4 bg-zinc-50 flex justify-end">
                    <Button onClick={() => window.location.reload()}>Apply Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}