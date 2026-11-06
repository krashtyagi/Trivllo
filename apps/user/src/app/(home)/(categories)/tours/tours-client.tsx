'use client'

import FilterBox from '@/components/filter-bar/fiter_box'
import MainFramePage from '@/components/frame-pages/ToursFramePage'
import { PageSkeleton } from '@/components/loader/skeleton'
import { MessageModal } from '@/components/messagemodal'
import { cn } from '@/lib/utils'
import { CommonPagesStyles } from '@/styles/commonpages-styles'
import React, { Suspense, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import SearchInput from '@/constants/search-box-components/search-input'
import { Calendar, MapPin, User } from 'lucide-react'
import { useToursStore } from '@/store/tours.store'
import HotelCalendern from '@/components/navbar/filter-nav-bar/calander05'
import { CityTrends } from '@/types'
import GuestSelector from '@/components/filter-bar/newui-selectedCounter'
// import { HotelPopularCites } from '../buses/page'
export const HotelPopularCites: CityTrends[] = [
  {
    name: "cabs",
    tagline: "Premium cabs services",
    tabs: [
      { name: "Primium" },
      { name: "Luxury" },
      { name: "Economy" },
      { name: "Prime Luxury" },
      {
        name: "Elite"
      }
    ]

  },
  {
    name: "Bangalore",
    tagline: "Available feets near you",
    tabs: [
      { name: "Ecnomy" },
      { name: "Mini" },
      { name: "Sedan" },
      { name: "Prime" },
      {
        name: "Ececutive"
      }
    ]
  },
  {
    name: "south goa",
    tagline: "Available feets near you"
  },
  {
    name: "Bangalore",
    tagline: "Available feets near you"
  },
  {
    name: "south goa",
    tagline: "Available feets near you"
  },
  {
    name: "Bangalore",
    tagline: "Available feets near you"
  },
]
export default function ToursClientPage() {
  const { city, setCity, date, guests } = useToursStore()

  useEffect(() => {
    localStorage.removeItem("nextRoute")
    localStorage.removeItem("like")
  }, [])

  return (
    <div className={cn(" w-full")}>
      <ErrorBoundary fallback={<MessageModal title="Error" description="Something went wrong" />}>
        <Suspense fallback={<PageSkeleton />}>
          <FilterBox city={city} date={date} guests={guests} FilterBoxValues={{
            filterBlocks: [
              {
                label: "Booking Date",
                icon: Calendar,
                element: <HotelCalendern hookname='tours' />,
                text: "Add dates",
              },
              {
                label: "Guests",
                icon: User,
                element: <GuestSelector />,
                text: "Add Guests",
              },
            ],
            videos: [
              {
                title: "Capture the Joy.",
                description: "450+ vacation rentals, 120 local guides, and endless memories.",
                link: "/search-box-videos/happy.mp4"
              },
              {
                title: "The Open Road.",
                description: "800+ car rentals, 50 scenic routes, and 24/7 roadside support.",
                link: "/search-box-videos/road.mp4"
              },
              {
                title: "Reach New Heights.",
                description: "15 balloon tours, 3 private flight paths, and breathtaking sunrise views.",
                link: "/search-box-videos/hot-air.mp4"
              }
            ]
          }} type="home" link="/tours" directions={
            <div className="w-full flex gap-2">
              <div className="flex-1">
                <SearchInput Icon={MapPin} placeholder="Search for tours" label="tour" value={city} setCity={(e) => { setCity(e) }} />
              </div>
            </div>
          } />

          <div className={cn(CommonPagesStyles, " md:flex-col  flex gap-4 w-full bg-background py-4 ")}>
            <MainFramePage
              type="tours"
              popularTrends={HotelPopularCites}
            />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
