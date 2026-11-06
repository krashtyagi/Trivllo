"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Building,
  MapPin,
  History,
  UploadCloud,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  Navigation,
  Compass,
  Calendar,
  Layers,
  Search,
  Plus,
  Tag,
  Save,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { axiosApi } from "@/lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import {
  IconsBundle,
  amenityIconMap,
  RoomFeatures,
  ComfortAndClimate,
  Facilities,
  FoodAndDrinks,
  RulesAndAccess,
  ConnectivityAndBusiness,
  Transport,
  Family,
  Locations,
} from "@/components/icons";
import { AiDescriptionButton } from "@/components/ai-description-button";
import { AdvertisementBannerSection } from "./_components/advertisement-banner-section";
import { HotelImageArranger, HotelImageItem } from "./_components/hotel-image-arranger";
import { cn } from "@/lib/utils";

// Dynamically import Leaflet LocationMap with SSR disabled
const LocationMap = dynamic(() => import("./_components/location-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] w-full rounded-2xl bg-muted/30 border border-border/60 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span>Loading interactive map...</span>
    </div>
  ),
});

interface LocationHistoryItem {
  address?: string | any;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: [number, number] | { lat?: number; lng?: number } | null;
  changedAt?: string | Date;
}

interface AddressDetails {
  formattedAddress?: string;
  streetAddress?: string;
  buildingName?: string;
  doorNumber?: string;
  areaName?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  landmark?: string;
  directions?: string;
  [key: string]: any;
}

interface PropertySettingsData {
  name: string;
  serviceType: string;
  description: string;
  address: string | AddressDetails;
  addressDetails?: AddressDetails;
  formattedAddress?: string;
  buildingName?: string;
  doorNumber?: string;
  areaName?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  landmark?: string;
  directions?: string;
  coordinates: [number, number];
  images: Array<{ url: string; public_id?: string; resource_type?: string }>;
  amenities: string[];
  locationHistory: LocationHistoryItem[];
  advertisementImage?: { url: string; public_id?: string; resource_type?: string } | null;
}

// Sleek Watermelon Section Save Button
function SectionSaveButton({
  saving,
  onClick,
  label = "Save",
  className,
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={saving}
      className={cn(
        "rounded-xl text-xs h-9 px-4 font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0",
        className
      )}
    >
      {saving ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="h-3.5 w-3.5" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

export default function PropertySettingsPage() {
  const { uploadFile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Per-section saving states
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [savingAmenities, setSavingAmenities] = useState(false);

  // Core Data
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [areaName, setAreaName] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [landmark, setLandmark] = useState("");
  const [directions, setDirections] = useState("");
  const [coords, setCoords] = useState<[number, number]>([28.6139, 77.209]);
  const [showDetailedAddress, setShowDetailedAddress] = useState(false);
  const [images, setImages] = useState<
    Array<{ url: string; public_id?: string; resource_type?: string }>
  >([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistoryItem[]>([]);
  const [adImage, setAdImage] = useState<{
    url: string;
    public_id?: string;
    resource_type?: string;
  } | null>(null);

  // Amenities UI
  const [amenitySearch, setAmenitySearch] = useState("");
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [amenityCategory, setAmenityCategory] = useState<string>("all");

  const AMENITY_CATEGORIES = useMemo(
    () => [
      { id: "all", label: "All Amenities" },
      { id: "room", label: "Room Features" },
      { id: "climate", label: "Comfort & Climate" },
      { id: "facilities", label: "Facilities & Wellness" },
      { id: "food", label: "Food & Drinks" },
      { id: "rules", label: "Rules & Access" },
      { id: "business", label: "Work & WiFi" },
      { id: "services", label: "Transport & Family" },
      { id: "custom", label: "Custom Added" },
    ],
    []
  );

  const categoryMap = useMemo<Record<string, string[]>>(() => {
    return {
      all: Array.from(new Set([...Object.keys(IconsBundle), ...amenities])),
      room: Object.keys(RoomFeatures),
      climate: Object.keys(ComfortAndClimate),
      facilities: Object.keys(Facilities),
      food: Object.keys(FoodAndDrinks),
      rules: Object.keys(RulesAndAccess),
      business: Object.keys(ConnectivityAndBusiness),
      services: [...Object.keys(Transport), ...Object.keys(Family), ...Object.keys(Locations)],
      custom: amenities.filter((a) => !(IconsBundle as any)[a]),
    };
  }, [amenities]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axiosApi.get("/vendors/property-settings");
      if (res.data?.success && res.data?.data) {
        const d: PropertySettingsData = res.data.data;
        setName(d.name || "");
        setServiceType(d.serviceType || "");
        setDescription(d.description || "");
        const addrObj: AddressDetails | null =
          typeof d.address === "object" && d.address !== null
            ? d.address
            : (d.addressDetails as AddressDetails | null | undefined) ?? null;
        setAddress(
          typeof d.address === "string"
            ? d.address
            : addrObj?.formattedAddress || addrObj?.streetAddress || d.formattedAddress || ""
        );
        setBuildingName(d.buildingName || addrObj?.buildingName || "");
        setDoorNumber(d.doorNumber || addrObj?.doorNumber || "");
        setAreaName(d.areaName || addrObj?.areaName || "");
        setDistrict(d.district || addrObj?.district || "");
        setCity(d.city || addrObj?.city || "");
        setState(d.state || addrObj?.state || "");
        setPostalCode(d.postalCode || addrObj?.postalCode || "");
        setCountry(d.country || addrObj?.country || "India");
        setLandmark(d.landmark || addrObj?.landmark || "");
        setDirections(d.directions || addrObj?.directions || "");

        if (
          d.buildingName ||
          d.doorNumber ||
          d.areaName ||
          d.district ||
          d.postalCode ||
          d.landmark ||
          d.directions
        ) {
          setShowDetailedAddress(true);
        }

        if (d.coordinates && Array.isArray(d.coordinates) && d.coordinates.length >= 2) {
          const c0 = Number(d.coordinates[0]);
          const c1 = Number(d.coordinates[1]);
          // GeoJSON stores [lng, lat]; Leaflet needs [lat, lng]
          if (c0 > 40 && c0 < 100 && c1 > 5 && c1 < 40) {
            setCoords([c1, c0]);
          } else {
            setCoords([c0, c1]);
          }
        }
        setImages(d.images || []);
        setAmenities(d.amenities || []);
        setLocationHistory(d.locationHistory || []);
        setAdImage(d.advertisementImage || null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to load property settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ── Section-level Save Handlers ─────────────────────────────────────

  const saveDescription = async () => {
    setSavingDescription(true);
    try {
      const res = await axiosApi.patch("/vendors/property-settings", { description });
      if (res.data?.success) {
        toast.success("Description updated!");
      } else {
        throw new Error(res.data?.message || "Failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save description");
    } finally {
      setSavingDescription(false);
    }
  };

  const saveLocation = async () => {
    setSavingLocation(true);
    try {
      const res = await axiosApi.patch("/vendors/property-settings", {
        address,
        buildingName,
        doorNumber,
        areaName,
        district,
        city,
        state,
        postalCode,
        country,
        landmark,
        directions,
        coordinates: [coords[1], coords[0]], // GeoJSON [lng, lat]
        lat: coords[0],
        lng: coords[1],
      });
      if (res.data?.success) {
        toast.success("Location & address updated!");
        await fetchSettings();
      } else {
        throw new Error(res.data?.message || "Failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save location");
    } finally {
      setSavingLocation(false);
    }
  };

  const saveImages = async (imagesToSave?: HotelImageItem[]) => {
    setSavingImages(true);
    try {
      const payloadImages = imagesToSave || images;
      const res = await axiosApi.patch("/vendors/property-settings", { images: payloadImages });
      if (res.data?.success) {
        toast.success("Property gallery photos & layout order saved!");
        if (imagesToSave) {
          setImages(imagesToSave);
        }
      } else {
        throw new Error(res.data?.message || "Failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save photos");
    } finally {
      setSavingImages(false);
    }
  };

  const saveAmenities = async () => {
    setSavingAmenities(true);
    try {
      const res = await axiosApi.patch("/vendors/property-settings", { amenities });
      if (res.data?.success) {
        toast.success("Amenities updated!");
      } else {
        throw new Error(res.data?.message || "Failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save amenities");
    } finally {
      setSavingAmenities(false);
    }
  };

  // ── Map & Location Helpers ──────────────────────────────────────────

  const handleMapCoordChange = async (newCoords: [number, number]) => {
    setCoords(newCoords);
    const [lat, lng] = newCoords;

    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      const cityVal = data.city || data.locality || "";
      const stateVal = data.principalSubdivision || "";
      const countryVal = data.countryName || "India";
      const postalCodeVal = data.postcode || "";
      const areaVal = data.locality || "";
      const districtEntry = data.localityInfo?.administrative?.find(
        (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
      );
      const districtVal = districtEntry?.name || "";

      if (cityVal) setCity(cityVal);
      if (stateVal) setState(stateVal);
      if (countryVal) setCountry(countryVal);
      if (postalCodeVal) setPostalCode(postalCodeVal);
      if (areaVal) setAreaName(areaVal);
      if (districtVal) setDistrict(districtVal);

      const fullAddress = [cityVal, stateVal, countryVal].filter(Boolean).join(", ");
      if (fullAddress && !address) setAddress(fullAddress);

      toast.success("Location coordinates & details synced!");
    } catch {
      toast.success(`Coords set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([latitude, longitude]);

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const cityVal = data.city || data.locality || "";
          const stateVal = data.principalSubdivision || "";
          const countryVal = data.countryName || "India";
          const postalCodeVal = data.postcode || "";
          const areaVal = data.locality || "";
          const districtEntry = data.localityInfo?.administrative?.find(
            (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
          );
          const districtVal = districtEntry?.name || "";

          if (cityVal) setCity(cityVal);
          if (stateVal) setState(stateVal);
          if (countryVal) setCountry(countryVal);
          if (postalCodeVal) setPostalCode(postalCodeVal);
          if (areaVal) setAreaName(areaVal);
          if (districtVal) setDistrict(districtVal);

          const fullAddress = [cityVal, stateVal, countryVal].filter(Boolean).join(", ");
          if (fullAddress) setAddress(fullAddress);

          toast.success("Location coordinates synced from your device!");
        } catch {
          toast.success(`Coordinates set to ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        toast.error(err.message || "Could not retrieve GPS location");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Image Upload Helpers ────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploaded: HotelImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await uploadFile(file);
        if (result?.url) {
          uploaded.push({
            url: result.url,
            public_id: result.public_id,
            resource_type: "image",
          });
        }
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploadingImages(false);
    e.target.value = "";
  };

  // ── Amenity Helpers ─────────────────────────────────────────────────

  const toggleAmenity = (key: string) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmed) return;
    if (!amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput("");
  };

  const filteredIconKeys = useMemo(() => {
    const activePool =
      amenityCategory === "all"
        ? Array.from(new Set([...Object.keys(IconsBundle), ...amenities]))
        : (categoryMap[amenityCategory] || Object.keys(IconsBundle));

    if (!amenitySearch.trim()) return activePool;
    const query = amenitySearch.toLowerCase();
    return activePool.filter((k) => k.toLowerCase().includes(query));
  }, [amenityCategory, amenitySearch, categoryMap, amenities]);

  // ── Loading State ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading property settings...</p>
      </div>
    );
  }

  // ── Render Watermelon UI ────────────────────────────────────────────

  return (
    <div className="w-full space-y-6 pb-24 font-sans">
      {/* ── Top Hero Banner (Watermelon Dashboard Style) ── */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card/60 to-muted/30 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950/40 backdrop-blur-xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/25 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Building className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
                  {name || "Property Settings"}
                </h1>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/25 font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                  {serviceType || "Hotel"}
                </Badge>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Manage promotional banner, description, gallery photos, amenities, and interactive map location. Each section saves independently.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="rounded-xl text-xs font-semibold gap-2 h-9 px-4 bg-background/80 hover:bg-muted border-border/60 hover:border-border shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <History className="h-4 w-4 text-primary" />
              <span>Location History</span>
              {locationHistory.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold text-[10px]">
                  {locationHistory.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Segmented Pill Tabs Navigation (No Overlapping Rows) ── */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <TabsList className="inline-flex sm:flex w-full min-w-max sm:min-w-0 items-center justify-start sm:justify-between h-auto p-1.5 bg-muted/40 dark:bg-zinc-800/40 backdrop-blur-md rounded-2xl border border-border/60 gap-1.5">
            <TabsTrigger
              value="overview"
              className="rounded-xl py-2.5 px-3.5 sm:px-4 text-xs font-semibold gap-2 shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60 transition-all duration-200 cursor-pointer"
            >
              <Building className="h-4 w-4 text-primary" />
              <span>Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value="location"
              className="rounded-xl py-2.5 px-3.5 sm:px-4 text-xs font-semibold gap-2 shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60 transition-all duration-200 cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span>Location & GPS</span>
            </TabsTrigger>

            <TabsTrigger
              value="photos"
              className="rounded-xl py-2.5 px-3.5 sm:px-4 text-xs font-semibold gap-2 shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60 transition-all duration-200 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4 text-primary" />
              <span>Photos</span>
              {images.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                  {images.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="amenities"
              className="rounded-xl py-2.5 px-3.5 sm:px-4 text-xs font-semibold gap-2 shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60 transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Amenities</span>
              {amenities.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                  {amenities.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="banner"
              className="rounded-xl py-2.5 px-3.5 sm:px-4 text-xs font-semibold gap-2 shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/60 transition-all duration-200 cursor-pointer"
            >
              <Tag className="h-4 w-4 text-primary" />
              <span>Promo Banner</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── 1. Property Overview Tab ─────────────────────────── */}
        <TabsContent value="overview" className="space-y-6 pt-1">
          <Card className="rounded-3xl border border-border/60 bg-card/75 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2.5 text-foreground">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                    <span>Property Overview</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Public description displayed on search results and property detail pages.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
                  <AiDescriptionButton
                    name={name}
                    serviceType={serviceType}
                    city={city}
                    state={state}
                    amenities={amenities}
                    currentDescription={description}
                    onGenerated={(aiText) => setDescription(aiText)}
                  />
                  <SectionSaveButton
                    saving={savingDescription}
                    onClick={saveDescription}
                    label="Save Description"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-3">
              <Textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the ambience, history, unique amenities, and experience of your property..."
                className="min-h-[140px] text-sm leading-relaxed p-4 rounded-xl border border-border/60 bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-y"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-primary shrink-0" />
                  Pro-tip: Include key attractions nearby, scenic views, and signature hospitality features.
                </span>
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md border border-border/40 self-end sm:self-auto">
                  {description.length} characters
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 2. Interactive Leaflet Map & Location Tab ──────── */}
        <TabsContent value="location" className="space-y-6 pt-1">
          <Card className="rounded-3xl border border-border/60 bg-card/75 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2.5 text-foreground">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>Property Location & GPS Coordinates</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Edit manually, point on the map, or sync using your device&apos;s current location.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="h-9 rounded-xl text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 transition-all shrink-0"
                  >
                    {isLocating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5" />
                    )}
                    <span>Use Current Location</span>
                  </Button>
                  <SectionSaveButton
                    saving={savingLocation}
                    onClick={saveLocation}
                    label="Save Location"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Leaflet Map Card */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold flex items-center gap-1.5 text-foreground">
                    <Compass className="h-3.5 w-3.5 text-primary" />
                    Interactive Map Pin (Click or drag marker to reposition)
                  </span>
                  <span className="font-mono text-[11px] bg-muted/60 border border-border/60 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                    Lat: {coords[0].toFixed(5)}, Lng: {coords[1].toFixed(5)}
                  </span>
                </div>
                <LocationMap center={coords} onChange={handleMapCoordChange} />
              </div>

              {/* Street Address */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold text-foreground">
                  Street / Formatted Address
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 104 Boulevard Road, Near Gate 2, Dal Lake"
                  className="rounded-xl border-border/60 bg-background/50 h-9 text-xs"
                />
              </div>

              {/* City, State, Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Srinagar"
                    className="rounded-xl border-border/60 bg-background/50 h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">State / Province</Label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Jammu & Kashmir"
                    className="rounded-xl border-border/60 bg-background/50 h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="rounded-xl border-border/60 bg-background/50 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Detailed Structured Address (Collapsible Card) */}
              <div className="pt-2 border-t border-border/40 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                  className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full cursor-pointer py-1.5"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Detailed Structured Address Breakdown</span>
                  <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
                    Building, Area, Landmark, Directions
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 ml-auto",
                      showDetailedAddress && "rotate-180"
                    )}
                  />
                </button>

                {showDetailedAddress && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/60 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Building / Property Name</Label>
                      <Input
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        placeholder="e.g. Pine View Residency"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Door / Floor Number</Label>
                      <Input
                        value={doorNumber}
                        onChange={(e) => setDoorNumber(e.target.value)}
                        placeholder="e.g. Suite 402, 4th Floor"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Area / Locality</Label>
                      <Input
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                        placeholder="e.g. Dal Lake Waterfront"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">District / County</Label>
                      <Input
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Srinagar District"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Postal Code / PIN</Label>
                      <Input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 190001"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Landmark</Label>
                      <Input
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="e.g. Opposite Ghat No. 2"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
                      <Label className="text-xs font-medium text-foreground">Directions to Reach</Label>
                      <Input
                        value={directions}
                        onChange={(e) => setDirections(e.target.value)}
                        placeholder="e.g. 200m from Central Boulevard, take lane opposite Gate 2"
                        className="rounded-xl border-border/60 bg-background/70 h-9 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Coord Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md pt-1">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground font-semibold">
                    Latitude
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={coords[0]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setCoords([val, coords[1]]);
                    }}
                    placeholder="e.g. 34.0837"
                    className="rounded-xl border-border/60 bg-background/50 h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground font-semibold">
                    Longitude
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={coords[1]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setCoords([coords[0], val]);
                    }}
                    placeholder="e.g. 74.7973"
                    className="rounded-xl border-border/60 bg-background/50 h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. Property Photos Gallery Tab ───────────────── */}
        <TabsContent value="photos" className="space-y-4 pt-1">
          <HotelImageArranger
            images={images}
            onChange={(updated) => setImages(updated)}
            onSave={saveImages}
            onUpload={handleImageUpload}
            saving={savingImages}
            uploading={uploadingImages}
            propertyName={name}
          />
        </TabsContent>

        {/* ── 4. Property Amenities Tab ─────────────────────── */}
        <TabsContent value="amenities" className="space-y-4 pt-1">
          <Card className="rounded-3xl border border-border/60 bg-card/75 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2.5 text-foreground">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span>Property Amenities & Features</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Select from verified amenities with icons or add custom tags.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search amenities..."
                      value={amenitySearch}
                      onChange={(e) => setAmenitySearch(e.target.value)}
                      className="pl-8 text-xs h-9 rounded-xl border-border/60 bg-background/50"
                    />
                  </div>
                  <SectionSaveButton
                    saving={savingAmenities}
                    onClick={saveAmenities}
                    label="Save Amenities"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Selected Amenities Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Amenities ({amenities.length})
                  </Label>
                  {amenities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmenities([])}
                      className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {amenities.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-4 rounded-xl border border-dashed border-border/60 text-center">
                    No amenities selected yet. Browse the catalog below to add features.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl border border-border/60 bg-muted/20">
                    {amenities.map((item) => {
                      const IconComponent = (IconsBundle as any)[item] || Tag;
                      return (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold capitalize shadow-xs transition-all hover:bg-primary/15"
                        >
                          <IconComponent className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.replace(/_/g, " ")}</span>
                          <button
                            type="button"
                            onClick={() => toggleAmenity(item)}
                            className="ml-1 hover:text-destructive transition-colors cursor-pointer"
                            title="Remove amenity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    Available Catalog ({filteredIconKeys.length} features)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Click any feature to toggle on/off
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {AMENITY_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setAmenityCategory(cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border",
                        amenityCategory === cat.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/70 border-transparent hover:text-foreground"
                      )}
                    >
                      {cat.label}
                      {cat.id === "custom" && categoryMap.custom.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-primary/20 text-primary rounded-full text-[10px]">
                          {categoryMap.custom.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                  {filteredIconKeys.map((key) => {
                    const IconComponent = (IconsBundle as any)[key] || Tag;
                    const isSelected = amenities.includes(key);
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => toggleAmenity(key)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold scale-[1.01]"
                            : "bg-background/60 hover:bg-muted/50 border-border/60 text-foreground"
                        }`}
                      >
                        <IconComponent className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate capitalize">{key.replace(/_/g, " ")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amenity Adder */}
              <div className="flex items-center gap-2 max-w-md pt-2">
                <Input
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  placeholder="Type custom amenity and press enter..."
                  className="text-xs h-9 rounded-xl border-border/60 bg-background/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomAmenity}
                  className="text-xs h-9 px-3.5 rounded-xl gap-1 shrink-0 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 5. Promotional Advertisement Banner Tab ────────── */}
        <TabsContent value="banner" className="space-y-4 pt-1">
          <AdvertisementBannerSection
            propertyName={name}
            serviceType={serviceType}
            city={city}
            initialAdImage={adImage}
            fallbackImageUrl={images[0]?.url || null}
            onUpdated={(newImg) => setAdImage(newImg)}
          />
        </TabsContent>
      </Tabs>

      {/* ── Location History Modal (Watermelon Dialog Style) ── */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-6">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <History className="h-4 w-4" />
              </div>
              <span>Location Audit History</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chronological log of property address and GPS coordinate updates.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {locationHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-2xl">
                <History className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p>No previous address revisions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Previous Records ({locationHistory.length})
                </p>
                {locationHistory.map((item, index) => {
                  const dateStr = item.changedAt
                    ? new Date(item.changedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Archived";

                  const addrObj = typeof item.address === "object" && item.address !== null ? item.address : null;
                  const displayAddress = addrObj
                    ? (addrObj.formattedAddress || addrObj.streetAddress || addrObj.buildingName || "Address recorded")
                    : (item.address || "Address not specified");
                  const displayCity = addrObj?.city || item.city || "";
                  const displayState = addrObj?.state || item.state || "";
                  const displayCountry = addrObj?.country || item.country || "";
                  const displayCoords = item.coordinates || addrObj?.location?.coordinates || null;

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {displayAddress}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono bg-muted/60 px-2 py-0.5 rounded-md shrink-0">
                          <Calendar className="h-3 w-3" />
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {[displayCity, displayState, displayCountry].filter(Boolean).join(", ")}
                      </p>
                      {displayCoords && (
                        <p className="text-[10px] text-muted-foreground font-mono bg-background/50 p-1.5 rounded-lg inline-block border border-border/40">
                          Coordinates: {JSON.stringify(displayCoords)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(false)}
              className="text-xs rounded-xl h-9 px-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
