"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LikeIcon } from "@/services/dailyfunctions"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetMyTrips } from "@/services/personal/queryes"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { RouterPush } from "@/components/RouterPush"
export type labelType = "favourites" | "wishlists"
export function SavedTripsSection({ setDetails, label, onClose }: {
    label: labelType,
    setDetails: React.Dispatch<React.SetStateAction<{ open: boolean; id: string; label: labelType }>>,
    onClose?: () => void
}) {
    // const {data:myTripdata_useGetMyTrips} = useGetMyTrips()
    //   console.log("myTripdata_useGetMyTrips",myTripdata_useGetMyTrips)
    const querys = {
        favourites: useGetMyTrips(),
        wishlists: useGetMyTrips()
    }
    const { data, isLoading } = querys[label as keyof typeof querys]
    const alldata = data?.data
    return (
        <div className="rounded-xl  bg-background md:p-8 p-0 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold px-2">My next trip</h2>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onClose ? onClose() : setDetails({ open: false, id: "", label: "favourites" })}>
                        Back
                    </Button>
                </div>
            </div>

            <div className="grid md:gap-6 grid-cols-2 lg:grid-cols-3 -mx-3">


                {isLoading ? [...Array(6)].map((_, i) => {
                    return (
                        <SavedPropertyCardSkeleton key={i} />
                    )
                }) :
                    alldata?.map((val: SavedPropertyCardProps) => {

                        return (
                            <SavedPropertyCard
                                name={val.name}
                                title={val.name}
                                thumbnail={val.thumbnail}
                                location={val.location}
                                city={val.city}
                                _id={val._id}
                                isFavorite={val.isFavorite}
                                numReviews={val.numReviews}
                                rating={val.rating}
                                distance="23"
                                key={val._id}
                                itemType={val.itemType}
                            />
                        )
                    })
                }



            </div>
        </div>
    )
}


interface SavedPropertyCardProps {
    name: string
    title: string
    _id: string
    thumbnail: string
    location: string
    distance: string
    city: string
    isFavorite: boolean
    numReviews: number
    rating: number
    itemType: string
}

export function SavedPropertyCard({
    title,
    thumbnail,
    location,
    distance,
    city,
    isFavorite,
    numReviews,
    rating,
    itemType,
    _id
}: SavedPropertyCardProps) {
    const router = useRouter()
    return (
        <Card onClick={() => {
            RouterPush(router, `/${itemType}s/${_id}`);
        }} className="group relative rounded-none md:rounded-xl min-w-[150px] overflow-hidden shadow-sm transition bg-background border-none py-0">
            {/* Image Container - Height stays fixed or aspect-ratio */}
            <div className="relative h-64 md:h-56 w-full">
                <Image
                    src={thumbnail.length > 50 ? thumbnail : "/noimage.png"}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Mobile Overlay Gradient: Only visible on small screens */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />

                {/* Favorite Icon */}
                <LikeIcon
                    serviceType={itemType}
                    _id={_id}
                    isFavourite={isFavorite || false}
                    name="card"
                    className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center z-10"
                />
            </div>

            {/* Content Container */}
            {/* MD: Relative (standard card) | SM: Absolute (overlay) */}
            <CardContent className={cn(
                "p-3 md:p-4 md:space-y-3 space-y-1",
                "absolute bottom-0 left-0 w-full md:relative md:bg-transparent", // Mobile overlay logic
                "text-white md:text-foreground" // Switch text color based on background
            )}>

                {/* Review/Rating Row */}
                <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-white border-none px-1.5 py-0 text-[10px] md:text-xs">
                        {/* {rating} */}
                    </Badge>
                    <span className="text-primary/50 md:text-primary font-medium text-[10px] md:text-xs">
                        Excellent
                    </span>
                    <span className="text-zinc-300 md:text-muted-foreground text-[10px] md:text-xs">
                        {numReviews}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm md:text-base leading-tight truncate">
                    {title}
                </h3>

                {/* Location & Note - Hidden or smaller on mobile to keep it clean */}
                <div className="space-y-1">
                    <p className="text-primary/80 md:text-primary/60 text-xs">
                        {city}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export function SavedPropertyCardSkeleton() {
    return (
        <Card className="group relative rounded-none md:rounded-xl min-w-[150px] overflow-hidden shadow-sm transition bg-background border-none py-0">
            {/* Image Container Skeleton */}
            <div className="relative h-64 md:h-56 w-full">
                <Skeleton className="w-full h-full rounded-none" />

                {/* Mobile Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />

                {/* Favorite Icon Skeleton */}
                <Skeleton className="absolute right-3 top-3 h-8 w-8 rounded-full z-10 bg-white/40 md:bg-muted" />
            </div>

            {/* Content Container Skeleton */}
            <CardContent className={cn(
                "p-3 md:p-4 md:space-y-3 space-y-2",
                "absolute bottom-0 left-0 w-full md:relative md:bg-transparent", // Mobile overlay logic
            )}>
                {/* Review/Rating Row Skeleton */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-6 md:h-5 md:w-8 rounded bg-white/40 md:bg-muted" />
                    <Skeleton className="h-3 md:h-4 w-12 bg-white/40 md:bg-muted" />
                    <Skeleton className="h-3 md:h-4 w-8 bg-white/40 md:bg-muted" />
                </div>

                {/* Title Skeleton */}
                <Skeleton className="h-4 md:h-5 w-[80%] bg-white/60 md:bg-muted" />

                {/* Location Skeleton */}
                <div className="space-y-1">
                    <Skeleton className="h-3 md:h-4 w-[60%] bg-white/40 md:bg-muted" />
                </div>
            </CardContent>
        </Card>
    )
}