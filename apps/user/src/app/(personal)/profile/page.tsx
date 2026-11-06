'use client'

import { cn } from "@/lib/utils"
import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { TabsContent } from "@/components/ui/tabscn"
import { useProfileSidebar } from "../../../providers/ProfileSidebarProvider"
import { PersonProfilePersonalData } from "./_components/personal_data/personal_data"
import Settings from "./_components/settings/settings"
import PaymentPage from "./_components/payment/payment"
import { AllReservations } from "./_components/trips/all"
import { WishlistSection } from "./_components/wishlist/wish-list"
import { ReviewList } from "./_components/reviews/my-reviews"
import { MessageModal } from "@/components/messagemodal"
import { PageSkeleton } from "@/components/loader/skeleton"
import { ProfileLayoutSkeleton } from "./_components/profile-skeleton"
import Support from "./_components/support/Support"
// import { ActiveReservations, AllReservations, CancelledReservations, CompletedReservations } from "./_components/trips/all"

type ProfileTabKey =
  | "personal_data"
  | "payment"
  | "wishlist"
  | "support"
  | "reviews"
  | "settings"
  | "all"
  | "active"
  | "completed"
  | "cancelled"

const content: Record<ProfileTabKey, React.ReactNode> = {
  personal_data: <PersonProfilePersonalData />,
  payment: <PaymentPage />,
  wishlist: <WishlistSection />,
  support:
    <Support />
  ,
  reviews: <ReviewList />,
  settings: <Settings />,
  all: <AllReservations variant={"all"} />,
  active: <AllReservations variant={"active"} />,
  completed: <AllReservations variant={"completed"} />,
  cancelled: <AllReservations variant={"cancelled"} />,
}

export default function Page() {
  const { navMain } = useProfileSidebar()

  const tabValues = [
    ...navMain.filter(t => !t.tabs).map(t => t.value),
    ...navMain.flatMap(t => t.tabs ?? []).map(t => t.value),
  ]

  return (
    <div className="w-full flex">
      <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
        <Suspense fallback={<ProfileLayoutSkeleton />}>
          {tabValues.map((value) => (
            <TabsContent
              key={value}
              value={value}
              className="w-full  "
            >
              {content[value as ProfileTabKey]}
            </TabsContent>
          ))}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
