"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  MapPinned,
  Clock,
  CalendarDays,
  Loader2,
  Route,
  Check,
  Pencil,
  MapPin,
  Mountain,
  Users,
  Tag,
  ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "../../rooms/_components/details.skeleton";
import {
  useGetToursServices,
  useGetTourServiceDetailsById,
  useDeleteTourService,
} from "@/services/tanstack.query";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Rupee from "@/components/rupee";
import Image from "next/image";
import { TourFeatures, TourAmenities } from "@/components/icons";
import { ImagePreview } from "@/components/ui/image-preview";

import { useCurrentUser } from "@/services/queryes";

const formatLabel = (key: string) => {
  if (!key) return "";
  return key
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/30 border border-border/70 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs md:text-sm font-bold text-foreground mt-0.5 truncate capitalize">{value}</p>
    </div>
  );
}

export interface TourListItem {
  id: string;
  title: string;
  description?: string;
  company: string;
  destinations: string[];
  duration: any;
  pricing: {
    basePrice: number;
    discountPrice: number;
  };
  isActive: boolean;
  images: { url: string; public_id?: string; resource_type?: string }[];
  tourType?: string[];
  amenities?: string[];
  features?: string[];
  maxPeople?: number;
  itinerary?: any[];
  meta?: {
    hotelType?: string;
    transport?: string;
    mealPlan?: string;
  };
}

export function ToursListing() {
  const [sortBy, setSortBy] = React.useState("popular");
  const [search, setSearch] = React.useState("");
  const [tourSelected, setTourSelected] = React.useState<string | null>(null);
  const router = useRouter();
  const { data: toursResponse, isLoading } = useGetToursServices();
  const { data: userResponse } = useCurrentUser();

  const tourId =
    userResponse?.data?.approvedData?.tourId ||
    userResponse?.data?.approvedData?.companyId ||
    userResponse?.data?.serviceDetails?.id ||
    userResponse?.data?.serviceDetails?._id;

  const targetSectionRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    targetSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const tours = (toursResponse?.data as TourListItem[]) || [];

  const filteredTours = React.useMemo(() => {
    let items = [...tours];
    if (search.trim() !== "") {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.company?.toLowerCase().includes(search.toLowerCase()) ||
          item.destinations?.some((d) => d.toLowerCase().includes(search.toLowerCase()))
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
  }, [tours, sortBy, search]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tour, destination, company..."
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

          {tourId && (
            <Button onClick={() => router.push("/tours/new")}>
              <MapPinned className="mr-2 h-4 w-4" />
              Add Tour
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_540px]">
        <div className="space-y-5">
          {filteredTours.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              No tours listed yet. Add a new tour service.
            </div>
          ) : (
            filteredTours.map((item) => {
              const images = item.images || [];
              const hasImages = images.length > 0;
              const hasDiscount =
                Boolean(item.pricing?.discountPrice && item.pricing?.basePrice && item.pricing.discountPrice < item.pricing.basePrice);
              const currentPrice = item.pricing?.discountPrice || item.pricing?.basePrice || 0;
              const colsClass =
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3";

              const durationLabel =
                typeof item.duration === "string"
                  ? item.duration
                  : `${item.duration?.days || 1}D / ${item.duration?.nights || 0}N`;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-all duration-200"
                >
                  {/* Image Strip with Fixed 200px Height */}
                  <div className="relative w-full h-[200px] overflow-hidden bg-muted">
                    {hasImages ? (
                      <div className={`grid ${colsClass} gap-1 w-full h-[200px]`}>
                        {images.slice(0, 3).map((img: any, i: number) => (
                          <ImagePreview key={i} src={img.url} alt={item.title}>
                            <div className="w-full h-[200px] overflow-hidden group relative">
                              <img
                                src={img.url}
                                alt={item.title}
                                className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {/* +N Overlay on 3rd image */}
                              {i === 2 && images.length > 3 && (
                                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                                  <span className="text-white text-base font-bold">
                                    +{images.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </ImagePreview>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-[200px] bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="text-[10px] font-semibold tracking-wide bg-indigo-600/90 hover:bg-indigo-600 text-white border-0 shadow-sm gap-1 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {durationLabel}
                      </Badge>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge
                        className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full ${
                          item.isActive
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-zinc-500 hover:bg-zinc-600 text-white"
                        } border-0 shadow-sm`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-3.5">
                    {/* Title + Price */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-bold text-foreground leading-snug truncate">
                          {item.title}
                        </h3>
                        {item.description ? (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">
                            Provided by: {item.company}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {hasDiscount && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{item.pricing.basePrice.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                          ₹{currentPrice.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                          /person
                        </p>
                      </div>
                    </div>

                    {/* Destinations */}
                    {item.destinations && item.destinations.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
                          {item.destinations.map((d: string, i: number) => (
                            <React.Fragment key={i}>
                              <span className="font-semibold text-foreground capitalize">{d}</span>
                              {i < item.destinations.length - 1 && (
                                <ChevronRight size={11} className="text-muted-foreground shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats Grid: Max People, Tour Type, Itinerary */}
                    <div className="grid grid-cols-3 gap-2">
                      <StatChip
                        icon={<Users size={12} />}
                        label="MAX PEOPLE"
                        value={`${item.maxPeople || 10}`}
                      />
                      <StatChip
                        icon={<Mountain size={12} />}
                        label="TOUR TYPE"
                        value={
                          item.tourType?.length
                            ? formatLabel(item.tourType[0])
                            : "Standard"
                        }
                      />
                      <StatChip
                        icon={<Tag size={12} />}
                        label="ITINERARY"
                        value={`${item.itinerary?.length || 1} Days`}
                      />
                    </div>

                    {/* Features Chips */}
                    {item.features && item.features.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {item.features.slice(0, 4).map((f: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/20 capitalize"
                          >
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                        {item.features.length > 4 && (
                          <span className="text-[11px] font-semibold text-muted-foreground px-1 py-1">
                            +{item.features.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Amenities & Inclusions */}
                    {item.amenities && item.amenities.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.amenities.slice(0, 5).map((a: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-muted/40 text-foreground px-2.5 py-1 rounded-lg border border-border capitalize"
                          >
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                        {item.amenities.length > 5 && (
                          <span className="text-[11px] font-semibold text-muted-foreground px-1 py-1">
                            +{item.amenities.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta Info (Hotel, Transport, Meal Plan) */}
                    {(item.meta?.hotelType || item.meta?.transport || item.meta?.mealPlan) && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-border/60">
                        {item.meta.hotelType && (
                          <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                            🏨 {item.meta.hotelType}
                          </span>
                        )}
                        {item.meta.transport && (
                          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            🚗 {item.meta.transport}
                          </span>
                        )}
                        {item.meta.mealPlan && (
                          <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/20">
                            🍽️ {item.meta.mealPlan}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions: Edit Listing & Details */}
                    <div className="mt-3 pt-3 flex items-center justify-between border-t border-dashed">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tours/${item.id}/edit`);
                        }}
                        className="rounded-xl text-xs gap-1.5 h-8 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Listing
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          handleScroll();
                          setTourSelected(item.id);
                        }}
                        className="rounded-full text-xs h-8"
                      >
                        Details
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <section ref={targetSectionRef}>
          <div className="space-y-6 lg:sticky lg:top-6 h-fit w-full">
            {tourSelected ? (
              <TourSideBarDetails tourId={tourSelected} setTourSelected={setTourSelected} />
            ) : (
              <div className="flex justify-center">
                <Card className="w-full shadow-lg rounded-2xl border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <MapPinned className="w-12 h-12 text-muted-foreground animate-pulse" />
                    <h2 className="text-2xl font-semibold tracking-tight">Select Tour</h2>
                    <p className="text-sm text-muted-foreground">
                      Click a tour to view details
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Tour Sidebar ──
const TourSideBarDetails = ({
  tourId,
  setTourSelected,
}: {
  tourId: string;
  setTourSelected: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const { data: tourResponse, isLoading, error } = useGetTourServiceDetailsById(tourId);
  const [activeImage, setActiveImage] = React.useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const deleteMutation = useDeleteTourService();

  const getImageUrl = (img: any) => (typeof img === "string" ? img : img?.url || "");

  React.useEffect(() => {
    if (tourResponse?.data?.images?.length) {
      setActiveImage(getImageUrl(tourResponse.data.images[0]));
    }
  }, [tourResponse]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 border rounded-2xl bg-card shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tourResponse?.data) {
    return <Card className="p-6 text-red-500">Failed to load tour details</Card>;
  }

  const t = tourResponse.data;
  const hasImages = t.images && t.images.length > 0;

  const hasDiscount =
    !!t.pricing?.discountPrice && t.pricing.discountPrice < t.pricing.basePrice;
  const hasItinerary = t.itinerary && t.itinerary.length > 0;

  const handleDelete = () => {
    deleteMutation.mutate(tourId, {
      onSuccess: (res) => {
        toast.success(res?.message || "Tour service deleted successfully");
        setTourSelected(null);
        setIsDeleteOpen(false);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete tour service");
      }
    });
  };

  return (
    <Card className="overflow-hidden shadow-md">
      <div className="flex justify-between items-center px-6 pt-4">
        <h1 className="text-sm font-medium text-muted-foreground">Tour Details</h1>
        <div className="flex gap-2">
          {/* Note: Tour edit/updating is not currently handled via a custom form sheet, but we show a placeholder delete button as requested */}
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
        serviceName={t.title}
        isLoading={deleteMutation.isPending}
      />

      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 mt-1 font-medium">
          <span className="text-xs text-muted-foreground">Company:</span>
          <span>{t.company?.name || "Independent"}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Images */}
        {hasImages ? (
          <div className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
              <img
                src={activeImage || getImageUrl(t.images[0])}
                alt={t.title}
                className="h-full w-full object-cover"
              />
            </div>
            {t.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {t.images.map((img: any, idx: number) => {
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
            <MapPinned className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <span className="text-xs">No images uploaded</span>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-xl">
          <div>
            <span className="text-xs text-muted-foreground block">Duration</span>
            <span className="font-semibold text-foreground">
              {t.duration?.days}D / {t.duration?.nights}N
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Max People</span>
            <span className="font-semibold text-foreground">{t.maxPeople || "N/A"}</span>
          </div>
        </div>

        {/* Destinations */}
        {t.destinations && t.destinations.length > 0 && (
          <div className="space-y-2 border-t border-dashed pt-4">
            <h4 className="font-semibold text-sm">Destinations</h4>
            <div className="flex flex-wrap gap-2">
              {t.destinations.map((dest: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-[10px]">
                  {dest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        {t.meta && (
          <div className="space-y-3 border-t border-dashed pt-4">
            <h4 className="font-semibold text-sm">Additional Details</h4>
            <div className="space-y-2 text-xs">
              {t.meta.hotelType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stay Type:</span>
                  <span className="font-medium text-foreground">{t.meta.hotelType}</span>
                </div>
              )}
              {t.meta.transport && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transport:</span>
                  <span className="font-medium text-foreground">{t.meta.transport}</span>
                </div>
              )}
              {t.meta.mealPlan && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meal Plan:</span>
                  <span className="font-medium text-foreground">{t.meta.mealPlan}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Pricing */}
        <div className="flex items-center justify-between border-t border-dashed pt-4">
          <div>
            <span className="text-xs text-muted-foreground">Rate Plan</span>
            <span className="block text-xs font-semibold text-green-600">Per Person</span>
          </div>
          <div className="text-right">
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through block">
                ₹{t.pricing.basePrice}
              </span>
            )}
            <span className="text-2xl font-black text-primary">
              ₹{t.pricing.discountPrice || t.pricing.basePrice}
            </span>
          </div>
        </div>

        {/* Tour Types / Categories */}
        {t.tourType && t.tourType.length > 0 && (
          <div className="space-y-2 border-t border-dashed pt-4">
            <h4 className="font-semibold text-sm">Tour Categories / Types</h4>
            <div className="flex flex-wrap gap-2">
              {t.tourType.map((type: string, idx: number) => {
                const IconComponent = TourFeatures[type];
                return (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                  >
                    {IconComponent && <IconComponent className="h-3.5 w-3.5 text-primary" />}
                    <span>{formatLabel(type)}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Inclusions & Amenities */}
        {t.amenities && t.amenities.length > 0 && (
          <div className="space-y-2 border-t border-dashed pt-4">
            <h4 className="font-semibold text-sm">Inclusions & Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              {t.amenities.map((amenity: string, idx: number) => {
                const IconComponent = TourAmenities[amenity];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs bg-muted/40 border rounded-lg px-2.5 py-2 font-medium"
                  >
                    {IconComponent ? (
                      <IconComponent className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                    <span className="truncate">{formatLabel(amenity)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Features */}
        {t.features &&
          t.features.filter((f: string) => f && f.trim().length > 0).length > 0 && (
            <div className="space-y-2 border-t border-dashed pt-4">
              <h4 className="font-semibold text-sm">Additional Features</h4>
              <div className="flex flex-wrap gap-2">
                {t.features
                  .filter((f: string) => f && f.trim().length > 0)
                  .map((feature: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-[10px]">
                      {feature}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

        {/* Description */}
        {t.description && (
          <div className="space-y-2 border-t border-dashed pt-4">
            <h4 className="font-semibold text-sm">Description</h4>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              {t.description}
            </p>
          </div>
        )}

        {/* Itinerary Button + Dialog */}
        {hasItinerary && (
          <div className="border-t border-dashed pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Route className="h-4 w-4" />
                  View Itinerary ({t.itinerary.length} Days)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">{t.title} - Itinerary</DialogTitle>
                </DialogHeader>
                <div className="space-y-0 mt-4">
                  {t.itinerary.map((day: any, idx: number) => (
                    <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                      {/* Timeline line */}
                      {idx < t.itinerary.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                      )}
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          {day.day}
                        </span>
                      </div>
                      <div className="border rounded-xl p-4 bg-muted/20 space-y-2">
                        <h4 className="font-semibold text-sm">{day.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {day.description}
                        </p>
                        {day.highlights && day.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {day.highlights.map((h: string, hIdx: number) => (
                              <span
                                key={hIdx}
                                className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
