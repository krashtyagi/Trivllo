import PaymentsContextProvider from "@/context/payments-form-provider";
import { cn } from "@/lib/utils";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BookingForm } from "./_components/paymentform";
import { PageSkeleton } from "@/components/loader/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { hooksSupplier } from "@/components/navbar/filter-nav-bar/calander05";

// Map plural URL category names → singular API serviceType
const serviceTypeMap: Record<string, string> = {
    tours: "tour",
    bikes: "bike",
    adventures: "adventure",
    cabs: "cab",
};

const page = async ({
    params,
    searchParams
}: {
    params: Promise<{ slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
    const { slug } = await params;
    const { categories, date, guests } = await searchParams;

    const hookname = (categories as keyof typeof hooksSupplier) || "tours";

    const serviceType = serviceTypeMap[hookname] || "tour";

    return (
        <div className="w-full">
            <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
                <Suspense fallback={<PageSkeleton />}>
                    <PaymentsContextProvider>
                        <BookingForm
                            slug={slug}
                            hookname={hookname}
                            serviceType={serviceType}
                            initialDate={date}
                            initialGuests={guests}
                        />
                    </PaymentsContextProvider>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
};

export default page;
