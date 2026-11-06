'use client'
import React from 'react';
import {
  ArrowLeft, BedDouble, Users, Maximize2, Eye, MapPin,
  Clock, Tag, Sparkles, Package, ImageIcon, Hotel,
  Mountain, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { usePropertyListings } from '../queryes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePreview } from '@/components/ui/image-preview';

// ─── Main Page ─────────────────────────────────────────────────────────────
const PropertyListingsContent = () => {
  const { propId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Array.isArray(propId) ? propId[0] : propId || "";
  const propertyId = searchParams.get('propertyId') || undefined;
  const { data, isLoading, isError } = usePropertyListings(id, propertyId);
  const listingsData = (data as any)?.data;

  if (isLoading) return <ListingSkeleton />;

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-foreground mb-1">Failed to Load</h2>
        <p className="text-sm text-muted-foreground mb-4">Could not fetch listings for this property.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const { serviceType, businessName, listings = [], count = 0 } = listingsData || {};
  const isHotel = serviceType === 'hotel';
  const title = isHotel ? 'Hotel Rooms' : 'Tour Packages';
  const Icon = isHotel ? Hotel : Package;

  return (
    <div className="min-h-screen font-sans">
      <div className="w-full mx-auto space-y-4">

        {/* Header */}
        <header className="rounded-2xl p-4 md:p-5 shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl shrink-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon size={18} />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">{title}</h1>
                  <p className="text-xs text-muted-foreground">{businessName || 'Property'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 bg-primary/5 text-primary border-primary/20 capitalize">
                <Icon className="w-3 h-3" />
                {serviceType}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1 px-3 py-1">
                {count} {isHotel ? (count === 1 ? 'Room Type' : 'Room Types') : (count === 1 ? 'Package' : 'Packages')}
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        {count === 0 ? (
          <EmptyState serviceType={serviceType} />
        ) : isHotel ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {listings.map((room: any) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {listings.map((pkg: any) => (
              <TourPackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Room Card ─────────────────────────────────────────────────────────────
function RoomCard({ room }: { room: any }) {
  const images = room.images || [];
  const hasImages = images.length > 0;
  const bedsLabel = room.beds?.map((b: any) => `${b.quantity}× ${b.type}`).join(', ') || 'N/A';
  const hasDiscount = room.discountPrice > 0 && room.discountPrice < room.basePrice;

  // Compute grid columns based on image count (up to 3)
  const colsClass = images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="rounded-3xl border border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-all duration-200">
      {/* Image Strip with Fixed Height */}
      <div className="relative w-full h-[200px] overflow-hidden bg-muted">
        {hasImages ? (
          <div className={`grid ${colsClass} gap-1 w-full h-[200px]`}>
            {images.slice(0, 3).map((img: any, i: number) => (
              <ImagePreview key={i} src={img.url} alt={room.name}>
                <div className="w-full h-[200px] overflow-hidden group relative">
                  <img
                    src={img.url}
                    alt={room.name}
                    className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* +N Overlay on the 3rd image if more exist */}
                  {i === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-base font-bold">+{images.length - 3}</span>
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

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full ${room.isActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-zinc-500 hover:bg-zinc-600 text-white'} border-0 shadow-sm`}>
            {room.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3.5">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-bold text-foreground leading-snug truncate capitalize">{room.name}</h3>
            {room.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{room.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">₹{room.basePrice.toLocaleString()}</p>
            )}
            <p className="text-xl md:text-2xl font-black text-foreground tracking-tight">₹{room.effectivePrice.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">/night</p>
          </div>
        </div>

        {/* Stats Grid: Capacity, Beds, Size, Rooms */}
        <div className="grid grid-cols-4 gap-2">
          <StatChip icon={<Users size={12} />} label="CAPACITY" value={`${room.capacity?.adults || 0}A / ${room.capacity?.children || 0}C`} />
          <StatChip icon={<BedDouble size={12} />} label="BEDS" value={bedsLabel} />
          <StatChip icon={<Maximize2 size={12} />} label="SIZE" value={room.roomSizeSqm ? `${room.roomSizeSqm} Sqm` : 'N/A'} />
          <StatChip icon={<Hotel size={12} />} label="ROOMS" value={`${room.totalRooms} Total`} />
        </div>

        {/* View Type */}
        {room.viewType && room.viewType !== 'none' && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <Eye size={13} className="text-blue-500 shrink-0" />
            <span className="capitalize">{room.viewType} View</span>
          </div>
        )}

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {room.amenities.slice(0, 6).map((a: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-muted/40 hover:bg-muted/70 text-foreground px-2.5 py-1 rounded-lg border border-border capitalize transition-colors"
              >
                {a.replace(/_/g, ' ')}
              </span>
            ))}
            {room.amenities.length > 6 && (
              <span className="text-[11px] font-semibold text-muted-foreground px-1 py-1">
                +{room.amenities.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tour Package Card ─────────────────────────────────────────────────────
function TourPackageCard({ pkg }: { pkg: any }) {
  const images = pkg.images || [];
  const hasImages = images.length > 0;
  const hasDiscount = pkg.discountPrice > 0 && pkg.discountPrice < pkg.basePrice;

  // Compute grid columns based on image count (up to 3)
  const colsClass = images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="rounded-3xl border border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-all duration-200">
      {/* Image Strip with Fixed Height */}
      <div className="relative w-full h-[200px] overflow-hidden bg-muted">
        {hasImages ? (
          <div className={`grid ${colsClass} gap-1 w-full h-[200px]`}>
            {images.slice(0, 3).map((img: any, i: number) => (
              <ImagePreview key={i} src={img.url} alt={pkg.title}>
                <div className="w-full h-[200px] overflow-hidden group relative">
                  <img
                    src={img.url}
                    alt={pkg.title}
                    className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* +N Overlay on the 3rd image if more exist */}
                  {i === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-base font-bold">+{images.length - 3}</span>
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

        {/* Duration + Status Badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className="text-[10px] font-semibold tracking-wide bg-indigo-600/90 hover:bg-indigo-600 text-white border-0 shadow-sm gap-1 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {pkg.duration}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full ${pkg.isActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-zinc-500 hover:bg-zinc-600 text-white'} border-0 shadow-sm`}>
            {pkg.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3.5">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-bold text-foreground leading-snug truncate">{pkg.title}</h3>
            {pkg.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pkg.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">₹{pkg.basePrice.toLocaleString()}</p>
            )}
            <p className="text-xl md:text-2xl font-black text-foreground tracking-tight">₹{pkg.effectivePrice.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">/person</p>
          </div>
        </div>

        {/* Destinations */}
        {pkg.destinations?.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin size={13} className="text-rose-500 shrink-0" />
            <div className="flex flex-wrap items-center gap-1 overflow-hidden">
              {pkg.destinations.map((d: string, i: number) => (
                <React.Fragment key={i}>
                  <span className="font-semibold text-foreground">{d}</span>
                  {i < pkg.destinations.length - 1 && (
                    <ChevronRight size={11} className="text-muted-foreground shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatChip icon={<Users size={12} />} label="MAX PEOPLE" value={`${pkg.maxPeople}`} />
          <StatChip
            icon={<Mountain size={12} />}
            label="TOUR TYPE"
            value={pkg.tourType?.length > 0 ? pkg.tourType[0].replace(/_/g, ' ') : 'N/A'}
          />
          <StatChip
            icon={<Tag size={12} />}
            label="ITINERARY"
            value={`${pkg.itinerary?.length || 0} Days`}
          />
        </div>

        {/* Features */}
        {pkg.features?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {pkg.features.slice(0, 5).map((f: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/20 capitalize"
              >
                {f.replace(/_/g, ' ')}
              </span>
            ))}
            {pkg.features.length > 5 && (
              <span className="text-[11px] font-semibold text-muted-foreground px-1 py-1">
                +{pkg.features.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Amenities */}
        {pkg.amenities?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {pkg.amenities.slice(0, 5).map((a: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-muted/40 text-foreground px-2.5 py-1 rounded-lg border border-border capitalize"
              >
                {a.replace(/_/g, ' ')}
              </span>
            ))}
            {pkg.amenities.length > 5 && (
              <span className="text-[11px] font-semibold text-muted-foreground px-1 py-1">
                +{pkg.amenities.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Meta Info (Hotel, Transport, Meal Plan) */}
        {(pkg.meta?.hotelType || pkg.meta?.transport || pkg.meta?.mealPlan) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
            {pkg.meta.hotelType && (
              <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                🏨 {pkg.meta.hotelType}
              </span>
            )}
            {pkg.meta.transport && (
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                🚗 {pkg.meta.transport}
              </span>
            )}
            {pkg.meta.mealPlan && (
              <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/20">
                🍽️ {pkg.meta.mealPlan}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────
function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/30 border border-border/70 rounded-xl px-3 py-2 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs md:text-sm font-bold text-foreground mt-1 truncate capitalize">{value}</p>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
function EmptyState({ serviceType }: { serviceType: string }) {
  const isHotel = serviceType === 'hotel';
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center min-h-[40vh]">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        {isHotel ? (
          <BedDouble className="w-7 h-7 text-muted-foreground/40" />
        ) : (
          <Package className="w-7 h-7 text-muted-foreground/40" />
        )}
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">
        No {isHotel ? 'Rooms' : 'Tour Packages'} Found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        This vendor hasn&apos;t added any {isHotel ? 'room types' : 'tour packages'} yet.
        They will appear here once the vendor creates them from their dashboard.
      </p>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function ListingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-2xl p-5 border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <div className="h-40 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-muted/40 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PropertyListingsPage() {
  return (
    <React.Suspense fallback={<ListingSkeleton />}>
      <PropertyListingsContent />
    </React.Suspense>
  );
}
