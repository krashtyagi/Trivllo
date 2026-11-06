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
    Car,
    MapPin,
    Users,
    Activity,
    Info,
    Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "../../rooms/_components/details.skeleton";
import { useGetCabsServices, useGetCabServiceDetailsById, useDeleteCabService } from "@/services/tanstack.query";
import EditCabForm from "./edit-cab-form";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/services/queryes";
import Rupee from "@/components/rupee";

export interface CabListItem {
    id: string;
    title: string;
    cabCompany: string;
    route: {
        pickup: string;
        drop: string;
    };
    car: {
        name: string;
        type: string;
        capacity: number;
    };
    pricing: {
        basePrice: number;
        discountPrice: number;
    };
    isActive: boolean;
}

export function CabListing() {
    const [sortBy, setSortBy] = React.useState("popular");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [cabSelected, setCabSelected] = React.useState<string | null>(null);
    const [editmode, setEditMode] = React.useState<{
        id: string;
        mode: boolean;
    }>({
        id: "",
        mode: false,
    });

    const router = useRouter();
    const { data: cabsResponse, isLoading } = useGetCabsServices();
    const [search, setSearch] = React.useState("");
    const targetSectionRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        targetSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const cabs = (cabsResponse?.data as CabListItem[]) || [];

    const filteredAndSortedCabs = React.useMemo(() => {
        let items = [...cabs];
        if (search.trim() !== "") {
            items = items.filter((cab) =>
                cab.title.toLowerCase().includes(search.toLowerCase()) ||
                cab.car.name.toLowerCase().includes(search.toLowerCase()) ||
                cab.cabCompany.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (typeFilter !== "all") {
            items = items.filter((cab) =>
                cab.car.type.toLowerCase() === typeFilter.toLowerCase()
            );
        }
        if (sortBy === "price-low") {
            items.sort((a, b) => {
                const pA = a.pricing.discountPrice || a.pricing.basePrice;
                const pB = b.pricing.discountPrice || b.pricing.basePrice;
                return pA - pB;
            });
        }
        if (sortBy === "price-high") {
            items.sort((a, b) => {
                const pA = a.pricing.discountPrice || a.pricing.basePrice;
                const pB = b.pricing.discountPrice || b.pricing.basePrice;
                return pB - pA;
            });
        }
        return items;
    }, [cabs, sortBy, typeFilter, search]);

    if (isLoading) {
        return (
            <div>
                <PageSkeleton />
            </div>
        );
    }

    if (editmode.mode && editmode.id) {
        return (
            <EditCabForm
                setEditMode={setEditMode}
                cabId={editmode.id}
            />
        );
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 ">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pickup, drop, car name, etc."
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
                                <SelectItem value="luxury">Luxury</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="economy">Economy</SelectItem>
                                <SelectItem value="suv">SUV</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => router.push("/cabs/new")}>
                        <Car className="mr-2 h-4 w-4" />
                        Add Cab
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_540px]">
                {/* Cab Cards */}
                <div className="space-y-5">
                    {filteredAndSortedCabs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            No Cabs listed. Add a new cab service.
                        </div>
                    ) : (
                        filteredAndSortedCabs.map((cab) => {
                            const currentPrice = cab.pricing.discountPrice || cab.pricing.basePrice;
                            const hasDiscount = !!cab.pricing.discountPrice && cab.pricing.discountPrice < cab.pricing.basePrice;

                            return (
                                <Card
                                    key={cab.id}
                                    onClick={() => {
                                        handleScroll();
                                        setCabSelected(cab.id);
                                        setEditMode({ id: cab.id, mode: false });
                                    }}
                                    className="group overflow-hidden border-muted/60 bg-background hover:shadow-md transition-all duration-300 cursor-pointer p-4"
                                >
                                    <div className="flex flex-col md:flex-row gap-5">
                                        {/* Icon Section */}
                                        <div className="relative w-full md:w-48 shrink-0 overflow-hidden rounded-2xl bg-muted/40 flex items-center justify-center p-6 border">
                                            <div className="text-primary/70 transition-transform duration-500 group-hover:scale-110">
                                                <Car className="h-16 w-16" />
                                            </div>

                                            {/* Status Badge */}
                                            <Badge
                                                variant={cab.isActive ? "default" : "destructive"}
                                                className="absolute left-3 top-3 backdrop-blur-md bg-opacity-90 shadow-sm border-none"
                                            >
                                                <span className="relative flex h-2 w-2 mr-2">
                                                    <span
                                                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cab.isActive ? "bg-green-400" : "bg-red-400"}`}
                                                    ></span>
                                                    <span
                                                        className={`relative inline-flex rounded-full h-2 w-2 ${cab.isActive ? "bg-green-500" : "bg-red-500"}`}
                                                    ></span>
                                                </span>
                                                {cab.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <CardTitle className="text-xl font-bold tracking-tight transition-colors">
                                                            {cab.title}
                                                        </CardTitle>
                                                        <p className="text-xs font-semibold text-muted-foreground mt-1">
                                                            Provided by: {cab.cabCompany}
                                                        </p>
                                                    </div>

                                                    {/* Pricing */}
                                                    <div className="text-right">
                                                        {hasDiscount && (
                                                            <p className="text-xs text-muted-foreground line-through">
                                                                ₹{cab.pricing.basePrice}
                                                            </p>
                                                        )}
                                                        <p className="text-2xl font-black text-primary">
                                                            <Rupee />{currentPrice}
                                                        </p>
                                                        <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">
                                                            Fixed Price
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Route Info */}
                                                <div className="mt-4 flex items-center gap-3 text-sm font-medium">
                                                    <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-full text-xs">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                                        <span>Pickup: {cab.route.pickup}</span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-full text-xs">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                                        <span>Drop: {cab.route.drop}</span>
                                                    </div>
                                                </div>

                                                {/* Car Specs */}
                                                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="capitalize border bg-card px-2.5 py-0.5 rounded-full font-medium">
                                                        Car: {cab.car.name}
                                                    </span>
                                                    <span className="capitalize border bg-card px-2.5 py-0.5 rounded-full font-medium">
                                                        Type: {cab.car.type}
                                                    </span>
                                                    <span className="border bg-card px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {cab.car.capacity} Seats
                                                    </span>
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

                {/* Right Sidebar - Cab Detail Preview */}
                <section ref={targetSectionRef}>
                    <div className="space-y-6 lg:sticky lg:top-6 h-fit w-full">
                        {cabSelected ? (
                            <CabSideBarDetails
                                cabId={cabSelected}
                                setEditMode={setEditMode}
                                setCabSelected={setCabSelected}
                            />
                        ) : (
                            <MessageModal
                                title="Select Cab"
                                description="Please select a cab to view details"
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
                    <Car className="w-12 h-12 text-muted-foreground animate-pulse" />
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

const CabSideBarDetails = ({
    cabId,
    setEditMode,
    setCabSelected,
}: {
    cabId: string;
    setEditMode: React.Dispatch<
        React.SetStateAction<{ id: string; mode: boolean }>
    >;
    setCabSelected: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const { data: cabDetailsResponse, isLoading, error } = useGetCabServiceDetailsById(cabId);
    const [activeImage, setActiveImage] = React.useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const deleteMutation = useDeleteCabService();

    const getImageUrl = (img: any) => {
        if (typeof img === "string") return img;
        return img?.url || "";
    };

    React.useEffect(() => {
        if (cabDetailsResponse?.data?.images?.length) {
            setActiveImage(getImageUrl(cabDetailsResponse.data.images[0]));
        }
    }, [cabDetailsResponse]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 border rounded-2xl bg-card shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !cabDetailsResponse?.data) {
        return <Card className="p-6 text-red-500">Failed to load cab details</Card>;
    }

    const cab = cabDetailsResponse.data;
    const hasImages = cab.images && cab.images.length > 0;

    const hasDiscount = !!cab.pricing?.discountPrice && cab.pricing?.discountPrice < cab.pricing?.basePrice;

    const handleDelete = () => {
        deleteMutation.mutate(cabId, {
            onSuccess: (res) => {
                toast.success(res?.message || "Cab service deleted successfully");
                setCabSelected(null);
                setIsDeleteOpen(false);
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to delete cab service");
            }
        });
    };

    return (
        <Card className="overflow-hidden shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-4">
                <h1 className="text-sm font-medium text-muted-foreground">
                    Cab Details
                </h1>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditMode({ id: cabId, mode: true })}
                    >
                        Edit Cab
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
                serviceName={cab.title}
                isLoading={deleteMutation.isPending}
            />

            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">{cab.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1 font-medium">
                    <span className="text-xs text-muted-foreground">Company:</span>
                    <span>{cab.cabCompany?.name || "Independent"}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Images */}
                {hasImages ? (
                    <div className="space-y-3">
                        <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={activeImage || getImageUrl(cab.images[0])}
                                alt={cab.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {cab.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {cab.images.map((img: any, idx: number) => {
                                    const imgUrl = getImageUrl(img);
                                    const isActive = activeImage === imgUrl;
                                    return (
                                        <div
                                            key={idx}
                                            className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 cursor-pointer transition-all ${
                                                isActive ? "border-primary scale-95" : "border-border hover:border-primary/40"
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
                        <Car className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <span className="text-xs">No images uploaded</span>
                    </div>
                )}

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-xl">
                    <div>
                        <span className="text-xs text-muted-foreground block">Car Model</span>
                        <span className="font-semibold text-foreground">{cab.car?.name}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Plate Number</span>
                        <span className="font-semibold text-foreground uppercase">{cab.car?.number || "N/A"}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Cab Type</span>
                        <span className="font-semibold text-foreground capitalize">{cab.car?.type}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Capacity</span>
                        <span className="font-semibold text-foreground">{cab.car?.capacity} Passengers</span>
                    </div>
                </div>

                {/* Route Info */}
                <div className="space-y-3 border-t border-dashed pt-4">
                    <h4 className="font-semibold text-sm">Route Specifications</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Pickup Location:</span>
                            <span className="font-medium text-foreground">{cab.route?.pickup}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Drop Location:</span>
                            <span className="font-medium text-foreground">{cab.route?.drop}</span>
                        </div>
                        {cab.meta?.distance && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Est. Distance:</span>
                                <span className="font-medium text-foreground">{cab.meta.distance}</span>
                            </div>
                        )}
                        {cab.meta?.duration && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Est. Duration:</span>
                                <span className="font-medium text-foreground">{cab.meta.duration}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Price Box */}
                <div className="flex items-center justify-between border-t border-dashed pt-4">
                    <div>
                        <span className="text-xs text-muted-foreground">Rate Plan</span>
                        <span className="block text-xs font-semibold text-green-600">Fixed Route Price</span>
                    </div>
                    <div className="text-right">
                        {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through block">
                                ₹{cab.pricing?.basePrice}
                            </span>
                        )}
                        <span className="text-2xl font-black text-primary">
                            ₹{cab.pricing?.discountPrice || cab.pricing?.basePrice}
                        </span>
                    </div>
                </div>

                {/* Features */}
                {cab.features && cab.features.length > 0 && (
                    <div className="space-y-2 border-t border-dashed pt-4">
                        <h4 className="font-semibold text-sm">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                            {cab.features.map((feature: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-[10px]">
                                    {feature}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                {cab.description && (
                    <div className="space-y-2 border-t border-dashed pt-4">
                        <h4 className="font-semibold text-sm">Service Description</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            {cab.description}
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
