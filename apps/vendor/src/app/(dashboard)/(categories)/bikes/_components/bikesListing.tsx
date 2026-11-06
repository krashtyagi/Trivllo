"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    ChevronRight,
    Bike,
    Settings,
    Activity,
    Info,
    Calendar,
    Gauge,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "../../rooms/_components/details.skeleton";
import { useGetBikesServices, useGetBikeServiceDetailsById, useDeleteBikeService } from "@/services/tanstack.query";
import EditBikeForm from "./edit-bike-form";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/services/queryes";
import Rupee from "@/components/rupee";

export interface BikeListItem {
    id: string;
    title: string;
    company: string;
    bike: {
        name: string;
        type: string;
        engine: number;
    };
    pricing: {
        pricePerDay: number;
        discountPrice: number;
    };
    isActive: boolean;
}

export function BikesListing() {
    const [sortBy, setSortBy] = React.useState("popular");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [bikeSelected, setBikeSelected] = React.useState<string | null>(null);
    const [editmode, setEditMode] = React.useState<{
        id: string;
        mode: boolean;
    }>({
        id: "",
        mode: false,
    });

    const router = useRouter();
    const { data: bikesResponse, isLoading } = useGetBikesServices();
    const [search, setSearch] = React.useState("");
    const targetSectionRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        targetSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const bikes = (bikesResponse?.data as BikeListItem[]) || [];

    const filteredAndSortedBikes = React.useMemo(() => {
        let items = [...bikes];
        if (search.trim() !== "") {
            items = items.filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.bike.name.toLowerCase().includes(search.toLowerCase()) ||
                item.company.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (typeFilter !== "all") {
            items = items.filter((item) =>
                item.bike.type.toLowerCase() === typeFilter.toLowerCase()
            );
        }
        if (sortBy === "price-low") {
            items.sort((a, b) => {
                const pA = a.pricing.discountPrice || a.pricing.pricePerDay;
                const pB = b.pricing.discountPrice || b.pricing.pricePerDay;
                return pA - pB;
            });
        }
        if (sortBy === "price-high") {
            items.sort((a, b) => {
                const pA = a.pricing.discountPrice || a.pricing.pricePerDay;
                const pB = b.pricing.discountPrice || b.pricing.pricePerDay;
                return pB - pA;
            });
        }
        return items;
    }, [bikes, sortBy, typeFilter, search]);

    if (isLoading) {
        return (
            <div>
                <PageSkeleton />
            </div>
        );
    }

    if (editmode.mode && editmode.id) {
        return (
            <EditBikeForm
                setEditMode={setEditMode}
                bikeId={editmode.id}
            />
        );
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 ">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bike name, engine CC, etc."
                    className="max-w-sm"
                />
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Label>Sort by:</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Popular</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label>Type:</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="cruiser">Cruiser</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="scooter">Scooter</SelectItem>
                                <SelectItem value="adventure">Adventure</SelectItem>
                                <SelectItem value="touring">Touring</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => router.push("/bikes/new")}>
                        <Bike className="mr-2 h-4 w-4" />
                        Add Bike
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_540px]">
                {/* Bike Cards */}
                <div className="space-y-5">
                    {filteredAndSortedBikes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            No Bikes listed. Add a new bike rental service.
                        </div>
                    ) : (
                        filteredAndSortedBikes.map((item) => {
                            const currentPrice = item.pricing.discountPrice || item.pricing.pricePerDay;
                            const hasDiscount = !!item.pricing.discountPrice && item.pricing.discountPrice < item.pricing.pricePerDay;

                            return (
                                <Card
                                    key={item.id}
                                    onClick={() => {
                                        handleScroll();
                                        setBikeSelected(item.id);
                                        setEditMode({ id: item.id, mode: false });
                                    }}
                                    className="group overflow-hidden border-muted/60 bg-background hover:shadow-md transition-all duration-300 cursor-pointer p-4"
                                >
                                    <div className="flex flex-col md:flex-row gap-5">
                                        {/* Icon Section */}
                                        <div className="relative w-full md:w-48 shrink-0 overflow-hidden rounded-2xl bg-muted/40 flex items-center justify-center p-6 border">
                                            <div className="text-primary/70 transition-transform duration-500 group-hover:scale-110">
                                                <Bike className="h-16 w-16" />
                                            </div>

                                            {/* Status Badge */}
                                            <Badge
                                                variant={item.isActive ? "default" : "destructive"}
                                                className="absolute left-3 top-3 backdrop-blur-md bg-opacity-90 shadow-sm border-none"
                                            >
                                                <span className="relative flex h-2 w-2 mr-2">
                                                    <span
                                                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.isActive ? "bg-green-400" : "bg-red-400"}`}
                                                    ></span>
                                                    <span
                                                        className={`relative inline-flex rounded-full h-2 w-2 ${item.isActive ? "bg-green-500" : "bg-red-500"}`}
                                                    ></span>
                                                </span>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold tracking-tight transition-colors">
                                                            {item.title}
                                                        </CardTitle>
                                                        <p className="text-xs font-semibold text-muted-foreground mt-1">
                                                            Provided by: {item.company}
                                                        </p>
                                                    </div>

                                                    {/* Pricing */}
                                                    <div className="text-right">
                                                        {hasDiscount && (
                                                            <p className="text-xs text-muted-foreground line-through">
                                                                ₹{item.pricing.pricePerDay}
                                                            </p>
                                                        )}
                                                        <p className="text-2xl font-black text-primary">
                                                            <Rupee />{currentPrice}
                                                        </p>
                                                        <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">
                                                            Per Day
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Specifications */}
                                                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                                                    <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-full text-foreground font-medium">
                                                        <Gauge className="h-3.5 w-3.5 text-primary" />
                                                        <span>Engine: {item.bike.engine} cc</span>
                                                    </div>
                                                    <div className="capitalize border bg-card px-2.5 py-0.5 rounded-full font-medium">
                                                        Model: {item.bike.name}
                                                    </div>
                                                    <div className="capitalize border bg-card px-2.5 py-0.5 rounded-full font-medium">
                                                        Type: {item.bike.type}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Button */}
                                            <div className="mt-4 pt-3 flex items-center justify-end border-t border-dashed">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                                >
                                                    Details
                                                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Right Sidebar - Bike Detail Preview */}
                <section ref={targetSectionRef}>
                    <div className="space-y-6 lg:sticky lg:top-6 h-fit w-full">
                        {bikeSelected ? (
                            <BikeSideBarDetails
                                bikeId={bikeSelected}
                                setEditMode={setEditMode}
                                setBikeSelected={setBikeSelected}
                            />
                        ) : (
                            <MessageModal
                                title="Select Bike"
                                description="Please select a bike to view details"
                                imgsrc="/select.png"
                                classImgDiv="h-50 w-50"
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export const MessageModal = ({
    title,
    description,
    className,
    imgsrc,
    classImgDiv,
}: {
    classImgDiv?: string;
    title: string;
    className?: string;
    description: string;
    imgsrc?: string;
}) => {
    return (
        <div className={cn("flex justify-center", className)}>
            <Card className="w-full shadow-lg rounded-2xl border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <Bike className="w-12 h-12 text-muted-foreground animate-pulse" />
                    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    {imgsrc && (
                        <div className={cn("md:w-60 md:h-60 w-40 h-40", classImgDiv)}>
                            <img
                                src={imgsrc}
                                alt={title}
                                className="w-full h-full object-contain opacity-80"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const BikeSideBarDetails = ({
    bikeId,
    setEditMode,
    setBikeSelected,
}: {
    bikeId: string;
    setEditMode: React.Dispatch<
        React.SetStateAction<{ id: string; mode: boolean }>
    >;
    setBikeSelected: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const { data: bikeDetailsResponse, isLoading, error } = useGetBikeServiceDetailsById(bikeId);
    const [activeImage, setActiveImage] = React.useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const deleteMutation = useDeleteBikeService();

    const getImageUrl = (img: any) => {
        if (typeof img === "string") return img;
        return img?.url || "";
    };

    React.useEffect(() => {
        if (bikeDetailsResponse?.data?.images?.length) {
            setActiveImage(getImageUrl(bikeDetailsResponse.data.images[0]));
        }
    }, [bikeDetailsResponse]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 border rounded-2xl bg-card shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !bikeDetailsResponse?.data) {
        return <Card className="p-6 text-red-500">Failed to load bike details</Card>;
    }

    const b = bikeDetailsResponse.data;
    const hasImages = b.images && b.images.length > 0;

    const hasDiscount = !!b.pricing?.discountPrice && b.pricing?.discountPrice < b.pricing?.pricePerDay;

    const handleDelete = () => {
        deleteMutation.mutate(bikeId, {
            onSuccess: (res) => {
                toast.success(res?.message || "Bike service deleted successfully");
                setBikeSelected(null);
                setIsDeleteOpen(false);
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to delete bike service");
            }
        });
    };

    return (
        <Card className="overflow-hidden shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-4">
                <h1 className="text-sm font-medium text-muted-foreground">
                    Bike Details
                </h1>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditMode({ id: bikeId, mode: true })}
                    >
                        Edit Bike
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                serviceName={b.title}
                isLoading={deleteMutation.isPending}
            />

            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">{b.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1 font-medium">
                    <span className="text-xs text-muted-foreground">Company:</span>
                    <span>{b.company?.name || "Independent"}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Images */}
                {hasImages ? (
                    <div className="space-y-3">
                        <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={activeImage || getImageUrl(b.images[0])}
                                alt={b.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {b.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {b.images.map((img: any, idx: number) => {
                                    const imgUrl = getImageUrl(img);
                                    const isActive = activeImage === imgUrl;
                                    return (
                                        <div
                                            key={idx}
                                            className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 cursor-pointer transition-all ${isActive ? "border-primary scale-95" : "border-border hover:border-primary/40"
                                                }`}
                                            onClick={() => setActiveImage(imgUrl)}
                                        >
                                            <img
                                                src={imgUrl}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="aspect-video rounded-lg border bg-muted/30 flex flex-col items-center justify-center text-muted-foreground p-6">
                        <Bike className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <span className="text-xs">No images uploaded</span>
                    </div>
                )}

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-xl">
                    <div>
                        <span className="text-xs text-muted-foreground block">Bike Name</span>
                        <span className="font-semibold text-foreground">{b.bike?.name}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Bike Type</span>
                        <span className="font-semibold text-foreground capitalize">{b.bike?.type}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Engine CC</span>
                        <span className="font-semibold text-foreground">{b.bike?.engine} cc</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Fuel Type</span>
                        <span className="font-semibold text-foreground capitalize">{b.bike?.fuel}</span>
                    </div>
                </div>

                {/* Route Info */}
                <div className="space-y-3 border-t border-dashed pt-4">
                    <h4 className="font-semibold text-sm">Specs & Parameters</h4>
                    <div className="space-y-2 text-xs">
                        {b.meta?.mileage && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mileage:</span>
                                <span className="font-medium text-foreground">{b.meta.mileage}</span>
                            </div>
                        )}
                        {b.meta?.gearType && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gearbox:</span>
                                <span className="font-medium text-foreground">{b.meta.gearType}</span>
                            </div>
                        )}
                        {b.maxDurationDays && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Max Duration:</span>
                                <span className="font-medium text-foreground">{b.maxDurationDays} Days</span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Price Box */}
                <div className="flex items-center justify-between border-t border-dashed pt-4">
                    <div>
                        <span className="text-xs text-muted-foreground">Rate Plan</span>
                        <span className="block text-xs font-semibold text-green-600">Daily Bike Rental</span>
                    </div>
                    <div className="text-right">
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through block">
                                ₹{b.pricing?.pricePerDay}
                            </span>
                        )}
                        <span className="text-2xl font-black text-primary">
                            ₹{b.pricing?.discountPrice || b.pricing?.pricePerDay}
                        </span>
                    </div>
                </div>

                {/* Features */}
                {b.features && b.features.length > 0 && (
                    <div className="space-y-2 border-t border-dashed pt-4">
                        <h4 className="font-semibold text-sm">Bike Features</h4>
                        <div className="flex flex-wrap gap-2">
                            {b.features.map((feature: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-[10px]">
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                {b.description && (
                    <div className="space-y-2 border-t border-dashed pt-4">
                        <h4 className="font-semibold text-sm">Description</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            {b.description}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const Loader2 = ({ className }: { className?: string }) => (
    <svg
        className={cn("animate-spin", className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);
