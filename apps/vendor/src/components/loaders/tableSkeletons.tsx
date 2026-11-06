import { Card } from "antd";
import { CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

export function ReservationsRowSkeleton() {
    return (
        <Skeleton className="h-5 w-full" />

    )
}
export function ReservationsRowSkeletonLarge() {
    return (
        <>
            <div className="flex w-full items-center gap-4">
                {/* <Skeleton className="size-10 shrink-0 rounded-xl" /> */}
                <div className="grid gap-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>

            </div>
            <Separator /></>
    )
}