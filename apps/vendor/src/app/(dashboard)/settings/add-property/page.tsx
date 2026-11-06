"use client";

import React, { useState, useRef, useTransition, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  ChevronRight,
  ChevronDown,
  Info,
  ShieldCheck,
  Search,
  ExternalLink,
  Check,
  Layers,
  ArrowRight,
  Camera,
  Star,
  Compass,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrentUser } from "@/services/queryes";
import { useAddProperty, useVendorProperties } from "@/services/property.query";
import { useAuthStore } from "@/stores/auth.store";
import { AiDescriptionButton } from "@/components/ai-description-button";
import {
  IconsBundle,
  amenityIconMap,
  hotelFeatures,
  RoomFeatures,
  ComfortAndClimate,
  Facilities,
  FoodAndDrinks,
  RulesAndAccess,
  ConnectivityAndBusiness,
  Transport,
  Family,
  Locations,
  TourFeatures,
  TourAmenities,
  CabFeatures,
  CabAmenities,
  BikeFeatures,
  BikeAmenities,
  AdventureFeatures,
  AdventureAmenities,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { SignUpProps } from "@/schema/auth";

// Dynamically load LocationPicker without SSR to prevent Leaflet window errors
const LocationPicker = dynamic(() => import("./_components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-2xl bg-muted/40 animate-pulse flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs border border-border">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span>Loading interactive map...</span>
    </div>
  ),
});

// Steps Configuration
const STEPS = [
  { id: 1, title: "Basic Info", icon: Building2, desc: "Name & Description" },
  { id: 2, title: "Location", icon: MapPin, desc: "Pin on Map & Address" },
  { id: 3, title: "Photo Gallery", icon: ImageIcon, desc: "Min. 5 Photos" },
  { id: 4, title: "Amenities", icon: Sparkles, desc: "Features & Perks" },
  { id: 5, title: "Review", icon: CheckCircle2, desc: "Preview & Submit" },
];

const PROPERTY_CATEGORIES = [
  "Boutique Hotel",
  "Luxury Resort",
  "Business Hotel",
  "Heritage Palace",
  "Villa / Homestay",
  "Budget Stay",
  "Bed & Breakfast",
];

// Dynamic amenity config by serviceType mapped to icons.tsx
const getAmenityConfig = (serviceType: string) => {
  switch (serviceType) {
    case "tour": {
      const map = { ...TourFeatures, ...TourAmenities };
      return {
        map,
        categories: [
          { id: "all", label: "All Items", keys: Object.keys(map) },
          {
            id: "features",
            label: "Tour Types & Styles",
            keys: Object.keys(TourFeatures),
          },
          {
            id: "amenities",
            label: "Inclusions & Perks",
            keys: Object.keys(TourAmenities),
          },
        ],
        essentials: [
          "guided_tour",
          "sightseeing",
          "hotel_pickup",
          "meals_included",
          "transport_included",
          "first_aid",
        ],
      };
    }
    case "cab": {
      const map = { ...CabFeatures, ...CabAmenities };
      return {
        map,
        categories: [
          { id: "all", label: "All Items", keys: Object.keys(map) },
          {
            id: "features",
            label: "Vehicle Features",
            keys: Object.keys(CabFeatures),
          },
          {
            id: "amenities",
            label: "Amenities & Services",
            keys: Object.keys(CabAmenities),
          },
        ],
        essentials: [
          "ac",
          "gps_navigation",
          "clean_cab",
          "verified_driver",
          "luggage_space",
          "support_24x7",
        ],
      };
    }
    case "bike": {
      const map = { ...BikeFeatures, ...BikeAmenities };
      return {
        map,
        categories: [
          { id: "all", label: "All Items", keys: Object.keys(map) },
          {
            id: "features",
            label: "Bike Features",
            keys: Object.keys(BikeFeatures),
          },
          {
            id: "amenities",
            label: "Rental Perks & Gear",
            keys: Object.keys(BikeAmenities),
          },
        ],
        essentials: [
          "helmet_included",
          "well_maintained",
          "disc_brakes",
          "puncture_kit",
          "side_stand",
        ],
      };
    }
    case "adventure": {
      const map = { ...AdventureFeatures, ...AdventureAmenities };
      return {
        map,
        categories: [
          { id: "all", label: "All Items", keys: Object.keys(map) },
          {
            id: "features",
            label: "Activities & Sports",
            keys: Object.keys(AdventureFeatures),
          },
          {
            id: "amenities",
            label: "Safety & Equipment",
            keys: Object.keys(AdventureAmenities),
          },
        ],
        essentials: [
          "safety_gear",
          "certified_instructors",
          "first_aid",
          "drinking_water",
          "emergency_kit",
        ],
      };
    }
    default: {
      // Hotel (default)
      const hotelEssentials = [
        "wifi",
        "free_wifi",
        "ac",
        "air_conditioning",
        "parking",
        "room_service",
        "daily_housekeeping",
        "swimming_pool",
        "pool",
        "breakfast",
        "hot_water",
        "front_desk",
        "power_backup",
      ];
      return {
        map: hotelFeatures,
        categories: [
          {
            id: "all",
            label: "All Amenities",
            keys: Object.keys(hotelFeatures),
          },
          { id: "essentials", label: "Essentials", keys: hotelEssentials },
          {
            id: "room",
            label: "Room Features",
            keys: Object.keys(RoomFeatures),
          },
          {
            id: "climate",
            label: "Comfort & Climate",
            keys: Object.keys(ComfortAndClimate),
          },
          {
            id: "facilities",
            label: "Facilities & Wellness",
            keys: Object.keys(Facilities),
          },
          {
            id: "food",
            label: "Food & Dining",
            keys: Object.keys(FoodAndDrinks),
          },
          {
            id: "rules",
            label: "Rules & Access",
            keys: Object.keys(RulesAndAccess),
          },
          {
            id: "business",
            label: "Work & WiFi",
            keys: Object.keys(ConnectivityAndBusiness),
          },
          {
            id: "services",
            label: "Transport & Location",
            keys: [
              ...Object.keys(Transport),
              ...Object.keys(Family),
              ...Object.keys(Locations),
            ],
          },
        ],
        essentials: hotelEssentials,
      };
    }
  }
};

export default function AddPropertyStudio() {
  const router = useRouter();
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const { data: propertiesData, isLoading: isPropertiesLoading } = useVendorProperties();
  const addPropertyMutation = useAddProperty();
  const { uploadFile, deleteFile } = useAuthStore();

  const properties = propertiesData?.data?.properties || [];
  const MAX_PROPERTIES = 50;
  const isLimitReached = properties.length >= MAX_PROPERTIES;

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDetailedAddress, setShowDetailedAddress] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [amenitySearch, setAmenitySearch] = useState("");
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [selectedAmenityCategory, setSelectedAmenityCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const approvedData = userData?.data?.approvedData;
  const serviceType = approvedData?.serviceType || "hotel";
  const entityName = serviceType === "tour" ? "Tour Company" : "Hotel";

  const methods = useForm<SignUpProps>({
    defaultValues: {
      name: "",
      description: "",
      hotelAddress: "",
      hotelCity: "",
      location: { type: "Point", coordinates: [72.8777, 19.076] },
      images: [],
      documents: [],
      amenities: [],
      city: "",
      state: "",
      buildingName: "",
      doorNumber: "",
      streetAddress: "",
      areaName: "",
      district: "",
      postalCode: "",
      landmark: "",
      directions: "",
      formattedAddress: "",
    } as any,
    mode: "onChange",
  });

  const { register, watch, setValue, getValues, control } = methods;

  const watchedName = watch("name") || "";
  const watchedDescription = watch("description") || "";
  const watchedCity = watch("hotelCity") || watch("city") || "";
  const watchedAddress = watch("hotelAddress") || "";
  const watchedImages = watch("images") || [];
  const watchedAmenities = watch("amenities") || [];
  const watchedLocation = watch("location") || {
    type: "Point",
    coordinates: [72.8777, 19.076],
  };

  // Step Completion Checks
  const isStep1Valid =
    watchedName.trim().length >= 3 && watchedDescription.trim().length >= 10;
  const isStep2Valid = watchedCity.trim().length >= 2;
  const isStep3Valid = watchedImages.length >= 5;
  const isStep4Valid = watchedAmenities.length >= 1;
  const isAllValid =
    isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  // Calculate readiness percentage
  const completedChecksCount = [
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
  ].filter(Boolean).length;
  const readinessPercent = Math.round((completedChecksCount / 4) * 100);

  // Dynamic amenity config and lookup from icons.tsx
  const amenityConfig = useMemo(
    () => getAmenityConfig(serviceType),
    [serviceType],
  );
  const allAmenityMap = amenityConfig.map;

  // Include any custom amenity that the user has selected into the keys list if not present
  const allAmenityKeys = useMemo(() => {
    const keys = new Set([...Object.keys(allAmenityMap), ...watchedAmenities]);
    return Array.from(keys);
  }, [allAmenityMap, watchedAmenities]);

  // Filtered Amenities based on search & category
  const filteredAmenityKeys = useMemo(() => {
    return allAmenityKeys.filter((key) => {
      const matchesSearch = key
        .toLowerCase()
        .replace(/_/g, " ")
        .includes(amenitySearch.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedAmenityCategory === "all") return true;
      const cat = amenityConfig.categories.find(
        (c) => c.id === selectedAmenityCategory,
      );
      return cat?.keys ? cat.keys.includes(key) : true;
    });
  }, [allAmenityKeys, amenitySearch, selectedAmenityCategory, amenityConfig]);

  // Helper to get matching icon from icons.tsx or bundle fallback
  const getAmenityIcon = (key: string): LucideIcon => {
    return (
      (allAmenityMap as Record<string, LucideIcon>)[key] ||
      (amenityIconMap as Record<string, LucideIcon>)[key] ||
      (IconsBundle as Record<string, LucideIcon>)[key] ||
      Sparkles
    );
  };

  // Handle GPS location auto-detection
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setValue(
          "location",
          {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          { shouldValidate: true },
        );

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await response.json();

          const city = data.city || data.locality || "";
          const stateVal = data.principalSubdivision || "";
          const countryVal = data.countryName || "India";
          const postalCode = data.postcode || "";
          const areaName = data.locality || "";
          const districtEntry = data.localityInfo?.administrative?.find(
            (a: any) =>
              a.description?.toLowerCase().includes("district") ||
              a.order === 6,
          );
          const district = districtEntry?.name || "";

          setValue("hotelCity", city, { shouldValidate: true });
          setValue("city", city);
          const fullAddress = [city, stateVal, countryVal]
            .filter(Boolean)
            .join(", ");
          setValue("hotelAddress", fullAddress, { shouldValidate: true });

          if (areaName) setValue("areaName", areaName);
          if (district) setValue("district", district);
          if (stateVal) setValue("state", stateVal);
          if (postalCode) setValue("postalCode", postalCode);
          setValue("formattedAddress", fullAddress);

          toast.success("Location coordinates & address synced!");
        } catch (error) {
          toast.error("Coordinates located, but failed to fetch address text.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error("Location permission denied.");
      },
      { enableHighAccuracy: true },
    );
  };

  // Multiple File Upload handler
  const handleMultipleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const fileList = Array.from(files);
    let successCount = 0;
    const currentList = getValues("images") || [];

    type ImageItem = { url: string; public_id: string; resource_type: string };

    const uploadPromises = fileList.map(
      async (file): Promise<ImageItem | null> => {
        try {
          const res = await uploadFile(file);
          if (res?.success && res?.url) {
            successCount++;
            return {
              url: res.url,
              public_id: res.public_id || "",
              resource_type: res.resource_type || "image",
            };
          }
          return null;
        } catch (err) {
          return null;
        }
      },
    );

    const results = await Promise.all(uploadPromises);
    const validUploaded = results.filter(
      (item): item is ImageItem => item !== null,
    );

    if (validUploaded.length > 0) {
      setValue("images", [...currentList, ...validUploaded], {
        shouldValidate: true,
      });
      toast.success(`${validUploaded.length} photo(s) uploaded successfully!`);
    } else {
      toast.error("Failed to upload photos. Please try again.");
    }

    setIsUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove Photo handler
  const handleRemovePhoto = async (index: number) => {
    const target = watchedImages[index];
    if (target?.public_id) {
      deleteFile(target.public_id, target.resource_type || "image").catch(
        console.error,
      );
    }
    const updated = watchedImages.filter((_, i) => i !== index);
    setValue("images", updated, { shouldValidate: true });
    toast.info("Photo removed");
  };

  // Set Cover Photo handler
  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    const target = watchedImages[index];
    const remaining = watchedImages.filter((_, i) => i !== index);
    setValue("images", [target, ...remaining], { shouldValidate: true });
    toast.success("Set as primary cover photo!");
  };

  // Toggle Amenity handler
  const handleToggleAmenity = (key: string) => {
    const current = getValues("amenities") || [];
    if (current.includes(key)) {
      setValue(
        "amenities",
        current.filter((k) => k !== key),
        { shouldValidate: true },
      );
    } else {
      setValue("amenities", [...current, key], { shouldValidate: true });
    }
  };

  // Quick Select All Essentials
  const handleSelectEssentials = () => {
    const essentials = amenityConfig.essentials || [];
    const current = getValues("amenities") || [];
    const merged = Array.from(new Set([...current, ...essentials]));
    setValue("amenities", merged, { shouldValidate: true });
    toast.success("Essential amenities added!");
  };

  // Add Custom Amenity handler
  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    const formatted = customAmenityInput
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const current = getValues("amenities") || [];
    if (!current.includes(formatted)) {
      setValue("amenities", [...current, formatted], { shouldValidate: true });
      toast.success(`Added "${customAmenityInput.trim()}"`);
    } else {
      toast.info(`"${customAmenityInput.trim()}" is already added`);
    }
    setCustomAmenityInput("");
  };

  // Submit Handler
  const handleSubmit = async () => {
    const values = methods.getValues();

    if (!values.name || values.name.trim().length < 3) {
      toast.error("Property name must be at least 3 characters");
      setCurrentStep(1);
      return;
    }

    if (!values.description || values.description.trim().length < 10) {
      toast.error("Please add a detailed description (at least 10 characters)");
      setCurrentStep(1);
      return;
    }

    if (!values.hotelCity && !values.city) {
      toast.error("Please specify the city in the Location step");
      setCurrentStep(2);
      return;
    }

    if (!values.images || values.images.length < 5) {
      toast.error(
        `Please upload at least 5 photos (currently ${values.images?.length || 0} uploaded)`,
      );
      setCurrentStep(3);
      return;
    }

    try {
      let payload: any = {};

      if (serviceType === "hotel") {
        payload = {
          name: values.name,
          description: values.description,
          hotelName: values.name,
          hotelAddress: values.hotelAddress,
          hotelCity: values.hotelCity || values.city,
          city: values.hotelCity || values.city,
          location: values.location,
          images: values.images,
          documents: values.documents || [],
          amenities: values.amenities || [],
          address: {
            buildingName: values.buildingName || "",
            doorNumber: values.doorNumber || "",
            streetAddress: values.streetAddress || values.hotelAddress || "",
            areaName: values.areaName || "",
            city: values.hotelCity || values.city || "",
            district: values.district || "",
            state: values.state || "",
            postalCode: values.postalCode || "",
            country: "India",
            countryCode: "IN",
            landmark: values.landmark || "",
            directions: values.directions || "",
            formattedAddress: values.formattedAddress || "",
            location: values.location,
          },
        };
      } else if (serviceType === "tour") {
        payload = {
          name: values.name,
          description: values.description,
          city: values.hotelCity || values.city,
          location: {
            city: values.hotelCity || values.city || "",
            state: values.state || "",
            country: "India",
          },
          coordinates: {
            lat: values.location?.coordinates?.[1] || null,
            lng: values.location?.coordinates?.[0] || null,
          },
          images: values.images,
          documents: values.documents || [],
          features: values.amenities || [],
          tags: [],
          address: {
            buildingName: values.buildingName || "",
            doorNumber: values.doorNumber || "",
            streetAddress: values.streetAddress || values.hotelAddress || "",
            areaName: values.areaName || "",
            city: values.hotelCity || values.city || "",
            district: values.district || "",
            state: values.state || "",
            postalCode: values.postalCode || "",
            country: "India",
            countryCode: "IN",
            landmark: values.landmark || "",
            directions: values.directions || "",
            formattedAddress: values.formattedAddress || "",
            location: values.location,
          },
        };
      }

      await addPropertyMutation.mutateAsync(payload);
      setSubmitted(true);
      toast.success("Property successfully submitted for review!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit property");
    }
  };

  // Loading state
  if (isUserLoading || isPropertiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading studio...</p>
      </div>
    );
  }

  // Guard limit reached
  if (isLimitReached) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Property Limit Reached</h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            You have reached the maximum limit of {MAX_PROPERTIES} properties allowed per vendor account.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Guard serviceType
  if (!serviceType || !["hotel", "tour"].includes(serviceType)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Service Type Not Supported</h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Multi-property management is currently enabled for hotels and tour
            companies.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Celebratory Success Screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-emerald-500/15 flex items-center justify-center ring-8 ring-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="text-center space-y-2 max-w-md">
          <Badge
            variant="outline"
            className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
          >
            Pending Admin Approval
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {watchedName || "Property"} Submitted!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your new {entityName.toLowerCase()} has been sent to the Trivllo
            verification team. You will be able to manage rooms, rates, and
            bookings once verified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
          <Button
            className="flex-1 gap-2 shadow-md"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSubmitted(false);
              methods.reset();
              setCurrentStep(1);
            }}
          >
            Add Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full border border-border/60 hover:bg-sidebar-accent"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Add New {entityName}
              </h1>
              <Badge variant="secondary" className="text-[11px] font-semibold">
                Studio
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Follow the steps to configure and publish your new property.
            </p>
          </div>
        </div>

        {/* Overall progress indicator */}
        <div className="flex items-center gap-3 bg-card px-3.5 py-2 rounded-xl border border-border/80 shadow-xs">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-medium text-muted-foreground">
              Readiness Score
            </span>
            <span className="text-xs font-bold text-foreground">
              {readinessPercent}% Complete
            </span>
          </div>
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                readinessPercent === 100
                  ? "bg-emerald-500"
                  : readinessPercent >= 50
                    ? "bg-primary"
                    : "bg-amber-500",
              )}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-card p-1.5 rounded-2xl border border-border/80 shadow-xs">
        {STEPS.map((step) => {
          const isCurrent = currentStep === step.id;
          const isPassed = currentStep > step.id;
          const isCompleted =
            (step.id === 1 && isStep1Valid) ||
            (step.id === 2 && isStep2Valid) ||
            (step.id === 3 && isStep3Valid) ||
            (step.id === 4 && isStep4Valid) ||
            (step.id === 5 && isAllValid);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer",
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : isPassed || isCompleted
                    ? "hover:bg-sidebar-accent/80 text-foreground"
                    : "hover:bg-sidebar-accent/40 text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isCurrent
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : isCompleted
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <step.icon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs truncate font-medium">
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-[10px] truncate",
                    isCurrent
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground",
                  )}
                >
                  {step.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Grid: Form (Col-8) + Real-time Preview (Col-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Area (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          <FormProvider {...methods}>
            <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
              <CardContent className="p-5 sm:p-7">
                {/* STEP 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-border/60">
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          Property Basics
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Give your property a name, category, and an appealing
                          description.
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Step 1 of 5
                      </Badge>
                    </div>

                    {/* Property Name */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          Property Name <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          {watchedName.length} / 60
                        </span>
                      </div>
                      <Input
                        placeholder="e.g. Grand Horizon Palace & Resort"
                        {...register("name")}
                        maxLength={60}
                        className="h-11 rounded-xl bg-background border-input focus-visible:ring-primary/30 text-sm font-medium"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Use a clear, recognizable name that guests can easily
                        identify.
                      </p>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">
                        Property Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PROPERTY_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setValue("buildingName", cat)}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium",
                              watch("buildingName") === cat
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-card hover:bg-sidebar-accent border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description + AI Generator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <AiDescriptionButton
                          name={watchedName}
                          serviceType={serviceType}
                          city={watchedCity}
                          amenities={watchedAmenities}
                          currentDescription={watchedDescription}
                          onGenerated={(aiText) =>
                            setValue("description", aiText, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                        />
                      </div>
                      <textarea
                        {...register("description")}
                        rows={5}
                        placeholder="Welcome guests with a warm introduction highlighting the ambience, architecture, and signature experiences..."
                        className="w-full rounded-xl bg-background border border-input p-3.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                      />
                      <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                        <span>Minimum 10 characters recommended</span>
                        <span>{watchedDescription.length} characters</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Location & Map */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-border/60">
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Location & Map Pin
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Accurately pinpoint your property entrance on the map
                          for guests.
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Step 2 of 5
                      </Badge>
                    </div>

                    {/* Quick GPS Location Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Compass className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Auto-Detect Current Location
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Instantly sync GPS coordinates and reverse-geocode
                            address.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isLocating}
                        onClick={handleGetCurrentLocation}
                        className="gap-2 shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Locating...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Use My Location</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Interactive Leaflet Map */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground">
                        Interactive Map Pin
                      </label>
                      <LocationPicker
                        value={[
                          watchedLocation.coordinates[1],
                          watchedLocation.coordinates[0],
                        ]}
                        onChange={(coords) =>
                          setValue("location", {
                            type: "Point",
                            coordinates: [coords[1], coords[0]],
                          })
                        }
                      />
                    </div>

                    {/* City & Address Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="e.g. Indore, Mumbai, Jaipur"
                          {...register("hotelCity")}
                          className="h-11 rounded-xl bg-background border-input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          State / Region
                        </label>
                        <Input
                          placeholder="e.g. Madhya Pradesh"
                          {...register("state")}
                          className="h-11 rounded-xl bg-background border-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Main Street Address
                      </label>
                      <Input
                        placeholder="e.g. 102 AB Road, Near Vijay Nagar Square"
                        {...register("hotelAddress")}
                        className="h-11 rounded-xl bg-background border-input"
                      />
                    </div>

                    {/* Detailed Address Collapsible */}
                    <div className="border border-border/70 rounded-xl p-3.5 bg-muted/20 space-y-3">
                      <button
                        type="button"
                        onClick={() =>
                          setShowDetailedAddress(!showDetailedAddress)
                        }
                        className="flex items-center justify-between w-full text-xs font-semibold text-foreground cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          Detailed Address (Landmark, Door No., Pincode)
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            Optional
                          </Badge>
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            showDetailedAddress && "rotate-180",
                          )}
                        />
                      </button>

                      {showDetailedAddress && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-200">
                          <Input
                            placeholder="Door / Floor Number"
                            {...register("doorNumber")}
                            className="h-10 text-xs bg-background"
                          />
                          <Input
                            placeholder="Area / Locality"
                            {...register("areaName")}
                            className="h-10 text-xs bg-background"
                          />
                          <Input
                            placeholder="District"
                            {...register("district")}
                            className="h-10 text-xs bg-background"
                          />
                          <Input
                            placeholder="Postal Code (PIN)"
                            {...register("postalCode")}
                            className="h-10 text-xs bg-background"
                          />
                          <Input
                            placeholder="Famous Landmark"
                            {...register("landmark")}
                            className="h-10 text-xs bg-background"
                          />
                          <Input
                            placeholder="Directions to reach"
                            {...register("directions")}
                            className="h-10 text-xs bg-background"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Photo Gallery */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-border/60">
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          Property Photos
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          High quality photos increase guest bookings by up to
                          80%.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold",
                          watchedImages.length >= 5
                            ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                            : "text-amber-500 border-amber-500/30 bg-amber-500/10",
                        )}
                      >
                        {watchedImages.length >= 5
                          ? "✓ Requirements Met"
                          : `${watchedImages.length} / 5 Required`}
                      </Badge>
                    </div>

                    {/* Multiple Upload Dropzone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group",
                        isUploadingImages
                          ? "bg-muted/40 border-muted pointer-events-none"
                          : "border-border hover:border-primary/60 hover:bg-primary/[0.02]",
                      )}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                      />

                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          {isUploadingImages ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <UploadCloud className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {isUploadingImages
                              ? "Uploading photos to Cloudinary..."
                              : "Click to browse or drag & drop photos"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Select multiple images at once (PNG, JPG, WebP up to
                            10MB each)
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="mt-1 pointer-events-none"
                        >
                          Select Photos from Device
                        </Button>
                      </div>
                    </div>

                    {/* Uploaded Photos Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          Uploaded Photos ({watchedImages.length})
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          First photo will be your primary cover
                        </span>
                      </div>

                      {watchedImages.length === 0 ? (
                        <div className="py-8 text-center rounded-xl border border-dashed border-border/80 text-muted-foreground text-xs">
                          No photos uploaded yet. Please add at least 5 photos.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                          {watchedImages.map((img: any, idx: number) => (
                            <div
                              key={idx}
                              className="group relative aspect-4/3 rounded-xl overflow-hidden border border-border shadow-xs bg-muted/20"
                            >
                              <img
                                src={img.url}
                                alt={`Property photo ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Cover Badge */}
                              {idx === 0 && (
                                <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                  <Star className="h-2.5 w-2.5 fill-white" />
                                  Cover
                                </div>
                              )}

                              {/* Overlay actions */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                {idx !== 0 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleSetCoverPhoto(idx)}
                                    className="h-7 text-[10px] px-2 bg-white/90 text-zinc-900 hover:bg-white"
                                  >
                                    Make Cover
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="h-7 w-7 rounded-lg"
                                  title="Delete photo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Amenities */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Amenities & Features
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Select the facilities, services, and perks available
                          at your property.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectEssentials}
                          className="h-8 text-xs border-primary/40 text-primary hover:bg-primary/10"
                        >
                          + Add All Essentials
                        </Button>
                        <Badge variant="secondary" className="text-xs">
                          {watchedAmenities.length} selected
                        </Badge>
                      </div>
                    </div>

                    {/* Active Selected Amenities Pills Strip */}
                    {watchedAmenities.length > 0 && (
                      <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03]">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Active Selected Amenities ({watchedAmenities.length}
                            )
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setValue("amenities", [], {
                                shouldValidate: true,
                              })
                            }
                            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                          {watchedAmenities.map((key) => {
                            const IconComponent = getAmenityIcon(key);
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium capitalize"
                              >
                                <IconComponent className="h-3.5 w-3.5 shrink-0" />
                                <span>{key.replace(/_/g, " ")}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAmenity(key)}
                                  className="ml-0.5 hover:text-destructive transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Search & Custom Amenity Input */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search amenities (e.g. WiFi, Pool, AC)..."
                            value={amenitySearch}
                            onChange={(e) => setAmenitySearch(e.target.value)}
                            className="pl-9 h-9 rounded-xl bg-background border-input text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 sm:max-w-xs w-full">
                          <Input
                            placeholder="Add custom (e.g. Helipad)..."
                            value={customAmenityInput}
                            onChange={(e) =>
                              setCustomAmenityInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomAmenity();
                              }
                            }}
                            className="h-9 text-xs rounded-xl bg-background border-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddCustomAmenity}
                            className="h-9 text-xs px-3 shrink-0 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </Button>
                        </div>
                      </div>

                      {/* Category Filters */}
                      <div className="flex flex-wrap gap-1.5">
                        {amenityConfig.categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedAmenityCategory(cat.id)}
                            className={cn(
                              "text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer",
                              selectedAmenityCategory === cat.id
                                ? "bg-primary text-primary-foreground border-primary font-medium shadow-xs"
                                : "bg-card hover:bg-sidebar-accent border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                      {filteredAmenityKeys.map((key) => {
                        const isSelected = watchedAmenities.includes(key);
                        const IconComp = getAmenityIcon(key);

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleToggleAmenity(key)}
                            className={cn(
                              "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer group",
                              isSelected
                                ? "bg-primary/10 border-primary/50 text-foreground shadow-2xs font-medium"
                                : "bg-background/60 hover:bg-sidebar-accent/60 border-border/80 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              <IconComp className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium truncate flex-1 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: Review & Publish */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-4 border-b border-border/60">
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Final Review
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Review all entered details before submitting to our
                          verification team.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold",
                          isAllValid
                            ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                            : "text-amber-500 border-amber-500/30 bg-amber-500/10",
                        )}
                      >
                        {isAllValid ? "Ready to Publish" : "Incomplete Details"}
                      </Badge>
                    </div>

                    {/* Summary Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name & Type */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Property Name
                        </span>
                        <p className="text-sm font-bold text-foreground">
                          {watchedName || "Not provided"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {watch("buildingName") || "Standard Property"}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Destination
                        </span>
                        <p className="text-sm font-bold text-foreground">
                          {watchedCity || "Not set"},{" "}
                          {watch("state") || "India"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {watchedAddress || "No street address"}
                        </p>
                      </div>

                      {/* Photo Count */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Photos Uploaded
                        </span>
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                          {watchedImages.length} Photos
                          {watchedImages.length >= 5 ? (
                            <Badge
                              variant="outline"
                              className="text-emerald-500 border-emerald-500/30 text-[10px]"
                            >
                              Requirement met
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="text-[10px]"
                            >
                              Min 5 required
                            </Badge>
                          )}
                        </p>
                      </div>

                      {/* Amenities Count & Summary */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Amenities Included
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {watchedAmenities.length} Selected
                          </span>
                        </div>
                        {watchedAmenities.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto pr-1">
                            {watchedAmenities.map((amenity) => {
                              const AmenityIcon = getAmenityIcon(amenity);
                              return (
                                <span
                                  key={amenity}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-foreground text-xs border border-border/80 capitalize"
                                >
                                  <AmenityIcon className="h-3 w-3 text-primary shrink-0" />
                                  <span>{amenity.replace(/_/g, " ")}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No amenities selected yet. Please select at least 1
                            amenity in Step 4.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description excerpt */}
                    <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Description Preview
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {watchedDescription || "No description provided."}
                      </p>
                    </div>

                    {/* Submission Advisory Notice */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                      <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">
                          What happens after submission?
                        </p>
                        <p className="mt-0.5">
                          Our team reviews listings within 24 to 48 hours to
                          ensure photo quality and location accuracy. You will
                          receive an email once approved and can start adding
                          rooms immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FormProvider>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1 || addPropertyMutation.isPending}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !isStep1Valid) {
                    toast.error(
                      "Please enter property name (3+ chars) and description",
                    );
                    return;
                  }
                  if (currentStep === 2 && !isStep2Valid) {
                    toast.error("Please enter at least the city for location");
                    return;
                  }
                  if (currentStep === 3 && !isStep3Valid) {
                    toast.error(
                      "Please upload at least 5 photos before proceeding",
                    );
                    return;
                  }
                  setCurrentStep((prev) => Math.min(5, prev + 1));
                }}
                className="gap-2"
              >
                <span>Next: {STEPS[currentStep]?.title || "Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={addPropertyMutation.isPending || !isAllValid}
                className="gap-2 min-w-[160px] bg-primary text-primary-foreground shadow-md hover:opacity-90"
              >
                {addPropertyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Submit for Review</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right Area: Real-Time Live Preview Card (Col 4) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-primary" />
              Live Guest Card Preview
            </span>
            <Badge
              variant="outline"
              className="text-[10px] text-primary border-primary/30"
            >
              Interactive
            </Badge>
          </div>

          {/* Guest Card Mockup */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg transition-all hover:shadow-xl">
            {/* Card Cover Image */}
            <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
              {watchedImages.length > 0 ? (
                <img
                  src={watchedImages[0].url}
                  alt="Property Preview"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-gradient-to-br from-muted/50 to-muted">
                  <ImageIcon className="h-8 w-8 stroke-1 text-muted-foreground/60" />
                  <span className="text-[11px] font-medium">
                    Cover photo preview
                  </span>
                </div>
              )}

              {/* Badges on preview image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <Badge className="bg-emerald-600 text-white font-bold text-[10px] shadow-sm">
                  New Property
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-black/60 text-white backdrop-blur-md text-[10px]"
                >
                  {entityName}
                </Badge>
              </div>

              <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-white flex items-center gap-1">
                <Camera className="h-3 w-3" />
                <span>{watchedImages.length} photos</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-foreground truncate leading-tight">
                  {watchedName || "Grand Palace & Resort"}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span>
                    {watchedCity || "City Name"}, {watch("state") || "India"}
                  </span>
                </p>
              </div>

              {/* Selected Amenities Chips Preview */}
              <div className="flex flex-wrap gap-1">
                {watchedAmenities.slice(0, 4).map((amenity) => {
                  const AmenityIcon = getAmenityIcon(amenity);
                  return (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 text-[10px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-md capitalize"
                    >
                      <AmenityIcon className="h-2.5 w-2.5 text-primary shrink-0" />
                      <span>{amenity.replace(/_/g, " ")}</span>
                    </span>
                  );
                })}
                {watchedAmenities.length > 4 && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
                    +{watchedAmenities.length - 4} more
                  </span>
                )}
                {watchedAmenities.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">
                    Select amenities to display here
                  </span>
                )}
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Pricing & Rooms
                </span>
                <span className="text-primary font-semibold text-[11px]">
                  Configured after review
                </span>
              </div>
            </div>
          </div>

          {/* Quick Readiness Checklist Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Requirements Checklist
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isStep1Valid
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  Property Name & Details
                </span>
                {isStep1Valid ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    3+ chars
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isStep2Valid
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  Location & Map
                </span>
                {isStep2Valid ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    City required
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isStep3Valid
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  Photos (Min. 5)
                </span>
                {isStep3Valid ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                ) : (
                  <span className="text-[10px] text-amber-500 font-medium">
                    {watchedImages.length} / 5
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isStep4Valid
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/40",
                    )}
                  />
                  Amenities (Min. 1)
                </span>
                {isStep4Valid ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    None selected
                  </span>
                )}
              </div>
            </div>

            {/* Quick Submit CTA from sidebar */}
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={addPropertyMutation.isPending || !isAllValid}
              className="w-full mt-2 gap-2 text-xs shadow-xs"
            >
              {addPropertyMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Submit for Review</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
