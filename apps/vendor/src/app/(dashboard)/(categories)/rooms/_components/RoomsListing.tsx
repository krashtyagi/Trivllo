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
  CheckCircle2,
  Users,
  BedDouble,
  Maximize2,
  ChevronRight,
  Pencil,
  Eye,
  Hotel,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "./details.skeleton";
import { useAllRooms, useRoomById, useDeleteRoomType } from "@/services/tanstack.query";
import { EditRoom } from "./edit-room-sheet";
import AddRoomForm from "../new/page";
import { ImagePreview } from "@/components/ui/image-preview";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { toast } from "sonner";

export type BedType = {
  _id?: string;
  type: "king" | "queen" | "single" | "double" | "twin" | string;
  quantity: number;
};

export type RoomCapacity = {
  adults: number;
  children: number;
};

export type RoomStatus = "available" | "unavailable" | "maintenance" | string;

export interface Room {
  id: string;
  name: string;
  description?: string;
  price: number;
  basePrice?: number;
  discountPrice?: number;
  effectivePrice?: number;
  capacity: RoomCapacity;
  roomSizeSqm: number;
  beds: BedType[];
  totalRooms: number;
  availableRooms: number;
  status: RoomStatus;
  isActive?: boolean;
  viewType?: string;
  amenities?: string[];
  image?: string;
  images?: Array<{ url: string; public_id?: string; resource_type?: string }>;
}

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

const features = [
  "Private balcony (where applicable)",
  "Work desk with ergonomic chair",
  "Spacious layout with a modern design",
  "Large views offering city or garden views",
];

const facilities = [
  "High-speed Wi-Fi",
  "In-room safe",
  "Mini-fridge",
  "Flat-screen TV",
  "Air conditioning",
  "Coffee/tea maker",
];

const amenities = [
  "Complimentary bottled water",
  "Luxury toiletries",
  "Coffee and tea making facilities",
  "Hairdryer and slippers",
  "En-suite bathroom with shower and bathtub",
  "24-hour room service",
];

export function RoomListing() {
  const [sortBy, setSortBy] = React.useState("popular");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [roomselected, setRoomSelected] = React.useState<string | null>(null);
  const { data: user } = useCurrentUser();
  const hotelId = user?.data?.approvedData?.hotelId || "";
  const [editmode, setEditMode] = React.useState<{
    id: string;
    mode: boolean;
  }>({
    id: "",
    mode: false,
  });

  const router = useRouter();
  const { data, isLoading } = useAllRooms();
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [roomToDelete, setRoomToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const deleteRoomMutation = useDeleteRoomType();

  const handleDeleteConfirm = () => {
    if (!roomToDelete) return;
    deleteRoomMutation.mutate(roomToDelete.id, {
      onSuccess: (res: any) => {
        toast.success(res?.message || "Room deleted successfully");
        if (roomselected === roomToDelete.id) {
          setRoomSelected(null);
        }
        setRoomToDelete(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || "Failed to delete room");
      },
    });
  };

  // Specify that the ref will point to an HTML element
  const targetSectionRef = React.useRef<HTMLDivElement>(null);

  // 2. Define the scroll handler
  const handleScroll = () => {
    targetSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const rosms = (data?.data as Room[]) || ([] as Room[]);

  const filteredAndSortedRooms = React.useMemo(() => {
    let rooms = [...rosms];
    if (search.trim() !== "") {
      rooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      rooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(typeFilter.toLowerCase()),
      );
    }
    if (sortBy === "price-low") {
      rooms.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-high") {
      rooms.sort((a, b) => b.price - a.price);
    }
    return rooms;
  }, [rosms, sortBy, typeFilter, search]);

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 1000);
    setLoading(false);
  }, [roomselected]);
  if (!data) {
    return (
      <div>
        <PageSkeleton />
      </div>
    );
  }
  if (editmode.mode && editmode.id) {
    return (
      <EditRoomForm
        setEditMode={setEditMode}
        hotelId={"sdf"}
        roomId={editmode.id}
      />
    );
  }
  return (
    <div className="flex min-h-screen flex-col gap-6 ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search room type, number, etc."
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
                <SelectItem value="all">All Type</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => router.push("/rooms/new")}>
            <Maximize2 className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_180px] xl:grid-cols-[1fr_540px]">
        {/* Room Cards - now smaller */}
        <div className="space-y-5">

          {filteredAndSortedRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              No rooms listed yet. Add a new room service.
            </div>
          ) : (
            filteredAndSortedRooms.map((room) => {
              const images = room.images?.length
                ? room.images
                : room.image
                ? [{ url: room.image }]
                : [];
              const hasImages = images.length > 0;
              const bedsLabel =
                room.beds?.map((b) => `${b.quantity}× ${b.type}`).join(", ") ||
                "N/A";
              const hasDiscount =
                Boolean(room.discountPrice && room.basePrice && room.discountPrice < room.basePrice);
              const colsClass =
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3";

              return (
                <div
                  key={room.id}
                  className="rounded-3xl border border-border/80 shadow-sm overflow-hidden bg-card hover:shadow-md transition-all duration-200"
                >
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

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge
                        className={`text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full ${
                          room.isActive !== false
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-zinc-500 hover:bg-zinc-600 text-white"
                        } border-0 shadow-sm`}
                      >
                        {room.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-3.5">
                    {/* Title + Price */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-bold text-foreground leading-snug truncate capitalize">
                          {room.name}
                        </h3>
                        {room.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {room.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {hasDiscount && (
                          <p className="text-xs text-muted-foreground line-through">
                            ₹{room.basePrice?.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                          ₹{(room.effectivePrice || room.price).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">
                          /night
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid: Capacity, Beds, Size, Rooms */}
                    <div className="grid grid-cols-4 gap-2">
                      <StatChip
                        icon={<Users size={12} />}
                        label="CAPACITY"
                        value={`${room.capacity?.adults || 0}A / ${room.capacity?.children || 0}C`}
                      />
                      <StatChip
                        icon={<BedDouble size={12} />}
                        label="BEDS"
                        value={bedsLabel}
                      />
                      <StatChip
                        icon={<Maximize2 size={12} />}
                        label="SIZE"
                        value={room.roomSizeSqm ? `${room.roomSizeSqm} Sqm` : "N/A"}
                      />
                      <StatChip
                        icon={<Hotel size={12} />}
                        label="ROOMS"
                        value={`${room.totalRooms || 1} Total`}
                      />
                    </div>

                    {/* View Type */}
                    {room.viewType && room.viewType !== "none" && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        <Eye size={13} className="text-blue-500 shrink-0" />
                        <span className="capitalize">{room.viewType} View</span>
                      </div>
                    )}

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {room.amenities.slice(0, 6).map((a: string, i: number) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-muted/40 hover:bg-muted/70 text-foreground px-2.5 py-1 rounded-lg border border-border capitalize transition-colors"
                          >
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                        {room.amenities.length > 6 && (
                          <span className="text-[11px] font-semibold text-muted-foreground px-1 py-1">
                            +{room.amenities.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons: Edit Listing, Delete & Details */}
                    <div className="mt-3 pt-3 flex items-center justify-between border-t border-dashed gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/rooms/${room.id}/edit`);
                          }}
                          className="rounded-xl text-xs gap-1.5 h-8 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Listing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomToDelete({ id: room.id, name: room.name });
                          }}
                          className="rounded-xl text-xs gap-1.5 h-8 font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          handleScroll();
                          setRoomSelected(room.id);
                          setEditMode({ id: room.id, mode: false });
                        }}
                        className="rounded-full text-xs h-8 shrink-0"
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

        <section ref={targetSectionRef}>
          <div className="space-y-6 lg:sticky lg:top-6 h-fit w-full">
            {roomselected ? (
              !loading ? (
                <PageSkeleton />
              ) : (
                <RoomSideBarDetails
                  editmode={editmode}
                  setEditMode={setEditMode}
                  onDelete={(id, name) => setRoomToDelete({ id, name })}
                />
              )
            ) : (
              <MessageModal
                title="Select Hotel"
                description="Please select a hotel"
                imgsrc="/select.png"
                classImgDiv="h-50 w-50"
              />
            )}
          </div>
        </section>
      </div>

      <DeleteConfirmationModal
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDeleteConfirm}
        serviceName={roomToDelete?.name || "Room"}
        isLoading={deleteRoomMutation.isPending}
      />
    </div>
  );
}

import { Building2 } from "lucide-react";
import EditRoomForm from "./edit-room-form";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/services/queryes";
import Rupee from "@/components/rupee";
import { useRef } from "react";

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
    <div className={cn("flex justify-center  ", className)}>
      <Card className="w-full  shadow-lg rounded-2xl border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-muted-foreground" />

          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>

          <p className="text-sm text-muted-foreground">{description}</p>
          {imgsrc && (
            <div className={cn("md:w-100 md:h-100 w-50 h-50", classImgDiv)}>
              <img
                src={imgsrc || "/nothing"}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export type DetailedRoom = {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number;
  discountPrice: number;

  capacity: {
    adults: number;
    children: number;
  };

  beds: Bed[];

  roomSizeSqm: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;

  status: "available" | "unavailable" | "maintenance";

  amenities: string[];

  images: RoomImage[];
};

export type Bed = {
  type: "king" | "queen" | "twin" | string;
  quantity: number;
  _id: string;
};

export type RoomImage = {
  url: string;
  public_id: string;
  resource_type: "image" | "video" | string;
  _id: string;
};
const RoomSideBarDetails = ({
  editmode,
  setEditMode,
  onDelete,
}: {
  editmode: { id: string; mode: boolean };
  setEditMode: React.Dispatch<
    React.SetStateAction<{ id: string; mode: boolean }>
  >;
  onDelete?: (id: string, name: string) => void;
}) => {
  const router = useRouter();
  const { data: user } = useCurrentUser();

  const { data, isLoading, error } = useRoomById(editmode.id);
  const [activeImage, setActiveImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (data?.data?.images?.length) {
      setActiveImage(data.data.images[0]?.url);
    }
  }, [data]);

  if (isLoading) {
    return <Card className="p-6">Loading...</Card>;
  }

  if (error || !data) {
    return <Card className="p-6 text-red-500">Failed to load room</Card>;
  }

  const room: DetailedRoom = data.data;

  return (
    <Card className="overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-4">
        <h1 className="text-sm font-medium text-muted-foreground">
          Room Details
        </h1>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/rooms/${room.id || editmode.id}/edit`)}
            className="rounded-xl text-xs gap-1 h-7.5"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete?.(room.id || editmode.id, room.name)}
            className="rounded-xl text-xs gap-1 h-7.5"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="md:text-3xl text-2xl">{room.name}</CardTitle>

        <CardDescription
          className={
            room.status === "available"
              ? "text-green-600 font-medium"
              : "text-red-500 font-medium"
          }
        >
          {room.status}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Images */}
        {room.images && room.images.length > 0 ? (
          <div className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
              <img
                src={activeImage || room.images[0]?.url}
                alt={room.name}
                className="h-full w-full object-cover"
              />
            </div>
            {room.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {room.images.map((img, idx) => {
                  const isActive = activeImage === img.url;
                  return (
                    <div
                      key={img._id || idx}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 cursor-pointer transition-all ${isActive ? "border-primary scale-95" : "border-border hover:border-primary/40"
                        }`}
                      onClick={() => setActiveImage(img.url)}
                    >
                      <img
                        src={img.url}
                        alt="Room preview"
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
            <span className="text-xs">No images uploaded</span>
          </div>
        )}

        {/* Price & Capacity */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Price:</span> ₹{room.price}
          </p>
          <p>
            <span className="font-medium">Base Price:</span> ₹{room.basePrice}
          </p>
          <p>
            <span className="font-medium">Capacity:</span>{" "}
            {room.capacity?.adults} Adults, {room.capacity?.children} Children
          </p>
          <p>
            <span className="font-medium">Room Size:</span> {room.roomSizeSqm}{" "}
            sqm
          </p>
        </div>

        <Separator />

        {/* Beds */}
        <div>
          <h4 className="mb-2 font-medium">Beds</h4>
          <ul className="space-y-1 text-sm">
            {room.beds.map((bed) => (
              <li key={bed._id}>
                {bed.quantity} × {bed.type}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Amenities */}
        <div>
          <h4 className="mb-2 font-medium">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((item) => (
              <Badge key={item} variant="outline" className="text-xs">
                {item.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" variant="secondary">
          View All Rooms
        </Button>
      </CardFooter>
    </Card>
  );
};
