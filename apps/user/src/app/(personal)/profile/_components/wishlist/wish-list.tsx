"use client"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import React from "react"
import { labelType, SavedTripsSection } from "./details-lists"
import { PageSkeleton } from "@/components/loader/skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useGetFavouriteSummary } from "@/services/personal/queryes"
import { useTranslation } from "@/hooks/useTranslation"
export interface WishListCardProps {
    id: string
    title: string
    label?: string
    savedCount: number
    images: string[]
    large?: boolean
    onCheckDetails?: () => void
}
export const wishlistData: WishListCardProps[] = [
    // {
    //     id: "1",
    //     title: "My next trip",
    //     savedCount: 6,
    //     images: [
    //         "/room1.png",
    //         "/room2.png",
    //         "/room3.png",
    //         "/img4.png",
    //     ],
    // },
    {
        id: "2",
        title: "Falkensee, Germany 2025",
        savedCount: 2,
        images: ["/hotels/img4.png"],
        large: true,
    },
    {
        id: "3",
        title: "Prague, Czechia 2025",
        savedCount: 1,
        images: ["/hotels/img4.png"],
        large: true,
    },
];

export function WishlistSection() {
    const { data: mytrips, isLoading } = useGetFavouriteSummary()
    const { t } = useTranslation()




    const [wishListOpen, setWishListOpen] = React.useState<{ open: boolean, id: string, label: labelType }>
        ({
            open: false,
            id: "",
            label: "wishlists"
        })

    // Sync browser history with wishlist details open/close
    React.useEffect(() => {
        if (!wishListOpen.open) return;

        // Push a history entry so the browser back button can close the details
        window.history.pushState({ wishlistDetails: true }, "");

        const handlePopState = () => {
            setWishListOpen({ open: false, id: "", label: "favourites" });
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [wishListOpen.open]);

    // When closing via the Back button in the UI, remove the extra history entry
    const handleCloseDetails = React.useCallback(() => {
        // Go back to pop the dummy history entry we pushed
        if (window.history.state?.wishlistDetails) {
            window.history.back();
        } else {
            setWishListOpen({ open: false, id: "", label: "favourites" });
        }
    }, []);

    if (wishListOpen.open) {
        return <SavedTripsSection setDetails={setWishListOpen} label={wishListOpen.label} onClose={handleCloseDetails} />
    }
    return (
        <div className="rounded-xl  shadow-sm md:p-8 p-3 md:space-y-8 space-y-3 bg-background pb-50">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">{t("wishlist.title")}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t("wishlist.subtitle")}
                    </p>
                </div>

                {/* <Button variant="outline" className="gap-2" >
                    <Plus size={16} />
                    Create a list
                </Button> */}
            </div>

            <div className="grid gap-6 sm:grid-cols-1  lg:grid-cols-3 ">
                {
                    isLoading ?
                        <WishlistCardSkeleton large={false} />
                        : <WishlistCard
                            id={"1"}
                            title={mytrips?.data?.name}
                            savedCount={mytrips?.data?.totalSaved}
                            images={mytrips?.data?.coverImages}
                            large={mytrips?.data?.coverImages?.length < 2}
                            onCheckDetails={() => setWishListOpen({ id: "1", open: true, label: "favourites" })}
                        />
                }
                {/* {
                    isLoading ? [...Array(2)].map((_, i) => {
                        return (
                            <WishlistCardSkeleton key={i} large={true} />
                        )
                    }) : (
                        wishlistData.map((val, i) => {
                            return (
                                <WishlistCard
                                    key={val.id}
                                    id={val.id}
                                    title={val.title}
                                    savedCount={val.savedCount}
                                    images={val.images || ["/hotels/roomIdeal.png"]}
                                    large={val.large}
                                    onCheckDetails={() => setWishListOpen({ id: val.id, open: true, label: "wishlists" })}
                                />
                            )
                        })
                    )
                } */}
            </div>
        </div>
    )
}



export function WishlistCard({
    title,
    savedCount,
    images,
    large = false,
    onCheckDetails

}: WishListCardProps) {

    return (
        <Card className="overflow-hidden min-w-[150px] rounded-xl shadow-sm hover:shadow-md transition bg-background" onClick={onCheckDetails} >
            <div className="p-3 space-y-4">
                {/* Image Section */}
                {large ? (
                    <div className="relative w-full h-60 rounded-lg overflow-hidden">
                        <Image
                            src={images[0] || "/hotels/roomIdeal.png"}
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {images?.slice(0, 4).map((img, index) => (
                            <div
                                key={index}
                                className="relative h-28 rounded-lg overflow-hidden"
                            >
                                <Image
                                    src={img || "/hotels/roomIdeal.png"}
                                    alt={`${title}-${index}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Text */}
                <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                        {savedCount} {useTranslation().t("wishlist.saved")}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export function WishlistCardSkeleton({ large = false }: { large?: boolean }) {
    return (
        <Card className="overflow-hidden min-w-[150px] rounded-xl shadow-sm bg-background">
            <div className="p-3 space-y-4">
                {/* Image Section */}
                {large ? (
                    <div className="relative w-full h-60 rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative h-28 rounded-lg overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>
                        <div className="relative h-28 rounded-lg overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>
                        <div className="relative h-28 rounded-lg overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>
                        <div className="relative h-28 rounded-lg overflow-hidden">
                            <Skeleton className="w-full h-full" />
                        </div>
                    </div>
                )}

                {/* Text */}
                <div>
                    <Skeleton className="h-6 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
        </Card>
    )
}

