
"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { X, MapPin, Building2, Info, Image as ImageIcon, FileText, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SignUpProps } from "@/schema/auth";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import ImageField from "./image-input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";
import { AiDescriptionButton } from "@/components/ai-description-button";




import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { hotelFeatures } from "@/components/icons";

// Fix for default Leaflet icon disappearing in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// SUB-COMPONENT: This handles the sliding animation
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            // .flyTo(coords, zoom, options)
            map.flyTo(center, 16, {
                animate: true,
                duration: 1.0, // 1 second duration as requested
            });
        }
    }, [center, map]);

    return null;
}

// SUB-COMPONENT: Handles clicking on the map to set location
function MapClickHandler({ onChange }: { onChange: (coords: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            onChange([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

interface LocationPickerProps {
    value: [number, number]; // [lat, lng]
    onChange: (coords: [number, number]) => void;
}

const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
    return (
        <div className="h-[300px] w-full relative">
            <MapContainer
                center={value}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* This component triggers the animation whenever 'value' changes */}
                <MapUpdater center={value} />
                <MapClickHandler onChange={onChange} />

                <Marker
                    position={value}
                    icon={icon}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            onChange([position.lat, position.lng]);
                        },
                    }}
                />
            </MapContainer>
        </div>
    );
};

export const amenityKeys = Object.keys(hotelFeatures) as (keyof typeof hotelFeatures)[];

export const CompanyLogoField = ({ logo, setValue }: { logo: any; setValue: any }) => {
    const handleRemoveLogo = () => {
        if (logo?.public_id) {
            useAuthStore.getState().deleteFile(logo.public_id, logo.resource_type || "image").catch((err) => {
                console.error("Failed to delete company logo from Cloudinary:", err);
            });
        }
        setValue("logo", undefined, { shouldValidate: true });
    };

    return (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200 font-semibold text-sm">Company Logo / Profile Image</FieldLabel>
                    <span className="text-[10px] text-muted-foreground bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 font-medium">Optional</span>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Upload your company or brand logo. You can also add or update this anytime later from your dashboard profile avatar.
            </p>
            <div className="flex items-center gap-4 pt-1">
                {logo?.url ? (
                    <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary/40 group bg-white/[0.04] shadow-md">
                        <img src={logo.url} alt="Company Logo" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                            title="Remove and delete logo"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="w-48">
                        <ImageField
                            label="Upload Logo / PFP"
                            docName="companyLogo"
                            onUploadSuccess={(data) => setValue("logo", { url: data.url, public_id: data.public_id, resource_type: data.resource_type }, { shouldValidate: true })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export const Step_3_hotel = ({ methods }: { currentStep: number; methods: UseFormReturn<SignUpProps> }) => {
    const { register, formState: { errors }, watch, setValue, control, getValues } = methods;

    const [isLocating, setIsLocating] = useState(false);
    const [showDetailedAddress, setShowDetailedAddress] = useState(false);
    const logo = watch("logo");
    const images = watch("images") || [];
    const documents = watch("documents") || [];
    const location = watch("location") || { type: "Point", coordinates: [72.8777, 19.0760] };
    const inputClasses = "h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;




                // 1. Update Map and Coordinates
                setValue("location", {
                    type: "Point",
                    coordinates: [longitude, latitude],
                }, { shouldValidate: true });

                try {
                    // 2. Reverse Geocode to get City and Country
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();

                    // 3. Auto-fill basic form fields
                    const city = data.city || data.locality || "";
                    const stateVal = data.principalSubdivision || "";
                    const countryVal = data.countryName || "India";
                    const postalCode = data.postcode || "";
                    const areaName = data.locality || "";
                    const districtEntry = data.localityInfo?.administrative?.find(
                        (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
                    );
                    const district = districtEntry?.name || "";

                    setValue("hotelCity", city);
                    const fullAddress = [city, stateVal, countryVal].filter(Boolean).join(", ");
                    setValue("hotelAddress", fullAddress);

                    // 4. Auto-fill structured address fields for deep address storage
                    if (areaName) setValue("areaName", areaName);
                    if (district) setValue("district", district);
                    setValue("state", stateVal);
                    if (postalCode) setValue("postalCode", postalCode);
                    setValue("country", countryVal);
                    setValue("formattedAddress", fullAddress);

                    toast.success("Location and address synced!");
                } catch (error) {
                    console.error("Error fetching address:", error);
                    toast.error("Coordinates found, but failed to fetch city/country names.");
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                setIsLocating(false);
                toast.error("Location access denied.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <FieldGroup className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Optional Company Logo */}
            <CompanyLogoField logo={logo} setValue={setValue} />

            {/* Property Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-slate-200">Hotel Name</FieldLabel>
                    </div>
                    <Input placeholder="Grand Plaza Hotel" {...register("name")} className={inputClasses} />
                </Field>

                <Field className="md:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <FieldLabel className="text-slate-200">Description</FieldLabel>
                        </div>
                        <AiDescriptionButton
                            name={watch("name")}
                            serviceType="hotel"
                            city={watch("city") || (watch("address") as any)?.city}
                            state={watch("state") || (watch("address") as any)?.state}
                            amenities={(((watch as any)("features") || (watch as any)("amenities") || []) as string[])}
                            currentDescription={watch("description")}
                            onGenerated={(aiText) => setValue("description", aiText, { shouldValidate: true, shouldDirty: true })}
                        />
                    </div>
                    <textarea
                        {...register("description")}
                        placeholder="Describe your property's unique charm..."
                        className={cn(inputClasses, "min-h-[100px] w-full rounded-md p-3 resize-none")}
                    />
                </Field>
            </div>

            <div className="h-px bg-white/5" />

            {/* Location Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <FieldLabel className="text-slate-200">Property Location</FieldLabel>
                        <p className="text-xs text-muted-foreground">Drag the pin to your exact property entrance.</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLocating}
                        onClick={handleGetCurrentLocation}
                        className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all gap-2"
                    >
                        {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                        {isLocating ? "Locating..." : "Use Current Location"}
                    </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <LocationPicker
                        value={[location.coordinates[1], location.coordinates[0]]}
                        onChange={(coords) => setValue("location", { type: "Point", coordinates: [coords[1], coords[0]] })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Address" {...register("hotelAddress")} className={inputClasses} />
                    <Input placeholder="City" {...register("hotelCity")} className={inputClasses} />
                </div>

                {/* Detailed Address (Collapsible) */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">Detailed Address</span>
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 ml-auto", showDetailedAddress && "rotate-180")} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Add building name, landmark, and other details to help guests find your property easily.
                    </p>

                    {showDetailedAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <Input placeholder="Building / Property Name" {...register("buildingName")} className={inputClasses} />
                            <Input placeholder="Door / Floor Number" {...register("doorNumber")} className={inputClasses} />
                            <Input placeholder="Area / Locality" {...register("areaName")} className={inputClasses} />
                            <Input placeholder="District" {...register("district")} className={inputClasses} />
                            <Input placeholder="State" {...register("state")} className={inputClasses} />
                            <Input placeholder="Postal Code" {...register("postalCode")} className={inputClasses} />
                            <Input placeholder="Landmark (e.g. Near Central Mall)" {...register("landmark")} className={inputClasses} />
                            <Input placeholder="Directions to reach" {...register("directions")} className={inputClasses} />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Media Gallery */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Property Gallery</FieldLabel>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-white/[0.02]"
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                type="button"
                                onClick={() => {
                                    const target = images[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "image").catch(console.error);
                                    }
                                    setValue("images", images.filter((_, i) => i !== index), { shouldValidate: true });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <div className="aspect-square relative flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden">
                            <ImageField
                                label="Add Photo"
                                variant="grid"
                                multiple={true}
                                onUploadSuccess={(data) => setValue("images", [...(getValues("images") || []), data], { shouldValidate: true })}
                            />
                        </div>
                    </div>
                </div>

                {errors.images && (
                    <p className="text-xs text-destructive font-medium">{errors.images.message}</p>
                )}
            </div>

            {/* Amenities Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Amenities & Features</FieldLabel>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenityKeys.map((id) => (
                        <FormField
                            key={id}
                            control={control}
                            name="amenities"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border border-white/5 p-4 hover:border-white/10 hover:bg-white/[0.01] transition-colors">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(id)}
                                            onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                return checked
                                                    ? field.onChange([...current, id])
                                                    : field.onChange(current.filter((val: string) => val !== id));
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className="text-xs font-normal text-slate-300 capitalize cursor-pointer">
                                        {id.replace(/_/g, " ")}
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                {errors.amenities && (
                    <p className="text-xs text-destructive font-medium">{errors.amenities.message}</p>
                )}
            </div>

            {/* Documents */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Property Documents</FieldLabel>
                </div>
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">{doc.docName}</span>
                                    <a href={doc.docUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary uppercase font-bold tracking-tight">View PDF</a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = documents[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "raw").catch(console.error);
                                    }
                                    setValue("documents", documents.filter((_, i) => i !== index));
                                }}
                                className="p-2 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <ImageField label="Upload License/Permit" onUploadSuccess={(data) => setValue("documents", [...documents, { docName: data.name, docUrl: data.url, public_id: data.public_id, resource_type: data.resource_type }])} />
                </div>
            </div>
        </FieldGroup>
    );
};

const cabFeatures = [
    "gps",
    "wifi",
    "ac",
    "carrier",
    "card_payment",
    "english_speaking_driver",
    "child_seat"
];

export const Step_3_cab = ({ methods }: { currentStep: number; methods: UseFormReturn<SignUpProps> }) => {
    const { register, formState: { errors }, watch, setValue, control, getValues } = methods;

    const [isLocating, setIsLocating] = useState(false);
    const [showDetailedAddress, setShowDetailedAddress] = useState(false);
    const logo = watch("logo");
    const images = watch("images") || [];
    const documents = watch("documents") || [];
    const location = watch("location") || { type: "Point", coordinates: [72.8777, 19.0760] };
    const inputClasses = "h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setValue("location", {
                    type: "Point",
                    coordinates: [longitude, latitude],
                }, { shouldValidate: true });

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();
                    const city = data.city || data.locality || "";
                    const stateVal = data.principalSubdivision || "";
                    const countryVal = data.countryName || "India";
                    const postalCode = data.postcode || "";
                    const areaName = data.locality || "";
                    const districtEntry = data.localityInfo?.administrative?.find(
                        (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
                    );
                    const district = districtEntry?.name || "";

                    setValue("hotelCity", city);
                    const fullAddress = [city, stateVal, countryVal].filter(Boolean).join(", ");
                    setValue("hotelAddress", fullAddress);

                    // Auto-fill structured address fields
                    if (areaName) setValue("areaName", areaName);
                    if (district) setValue("district", district);
                    setValue("state", stateVal);
                    if (postalCode) setValue("postalCode", postalCode);
                    setValue("country", countryVal);
                    setValue("formattedAddress", fullAddress);

                    toast.success("Location and address synced!");
                } catch (error) {
                    toast.error("Coordinates found, but failed to fetch address.");
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                setIsLocating(false);
                toast.error("Location access denied.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <FieldGroup className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Optional Company Logo */}
            <CompanyLogoField logo={logo} setValue={setValue} />

            {/* Cab Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-slate-200">Cab Company Name</FieldLabel>
                    </div>
                    <Input placeholder="e.g. Premium Cabs India" {...register("name")} className={inputClasses} />
                </Field>

                <Field className="md:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <FieldLabel className="text-slate-200">Description / Fleet Details</FieldLabel>
                        </div>
                        <AiDescriptionButton
                            name={watch("name")}
                            serviceType="cab"
                            city={watch("city") || (watch("address") as any)?.city}
                            state={watch("state") || (watch("address") as any)?.state}
                            amenities={(((watch as any)("features") || []) as string[])}
                            currentDescription={watch("description")}
                            onGenerated={(aiText) => setValue("description", aiText, { shouldValidate: true, shouldDirty: true })}
                        />
                    </div>
                    <textarea
                        {...register("description")}
                        placeholder="Describe your cab services, fleet capacity, safety protocols..."
                        className={cn(inputClasses, "min-h-[100px] w-full rounded-md p-3 resize-none")}
                    />
                </Field>
            </div>

            <div className="h-px bg-white/5" />

            {/* Location Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <FieldLabel className="text-slate-200">Office Location</FieldLabel>
                        <p className="text-xs text-muted-foreground">Select your primary depot or office location.</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLocating}
                        onClick={handleGetCurrentLocation}
                        className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all gap-2"
                    >
                        {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                        {isLocating ? "Locating..." : "Use Current Location"}
                    </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <LocationPicker
                        value={[location.coordinates[1], location.coordinates[0]]}
                        onChange={(coords) => setValue("location", { type: "Point", coordinates: [coords[1], coords[0]] })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Address" {...register("hotelAddress")} className={inputClasses} />
                    <Input placeholder="City" {...register("hotelCity")} className={inputClasses} />
                </div>

                {/* Detailed Address (Collapsible) */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">Detailed Address</span>
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 ml-auto", showDetailedAddress && "rotate-180")} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Add building name, landmark, and other details to help passengers and drivers locate your depot.
                    </p>

                    {showDetailedAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <Input placeholder="Building / Office Name" {...register("buildingName")} className={inputClasses} />
                            <Input placeholder="Door / Floor Number" {...register("doorNumber")} className={inputClasses} />
                            <Input placeholder="Area / Locality" {...register("areaName")} className={inputClasses} />
                            <Input placeholder="District" {...register("district")} className={inputClasses} />
                            <Input placeholder="State" {...register("state")} className={inputClasses} />
                            <Input placeholder="Postal Code" {...register("postalCode")} className={inputClasses} />
                            <Input placeholder="Landmark (e.g. Near Central Station)" {...register("landmark")} className={inputClasses} />
                            <Input placeholder="Directions to reach" {...register("directions")} className={inputClasses} />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Media Gallery */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Cab & Office Gallery</FieldLabel>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-white/[0.02]"
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                type="button"
                                onClick={() => {
                                    const target = images[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "image").catch(console.error);
                                    }
                                    setValue("images", images.filter((_, i) => i !== index), { shouldValidate: true });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <div className="aspect-square relative flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden">
                            <ImageField
                                label="Add Photo"
                                variant="grid"
                                multiple={true}
                                onUploadSuccess={(data) => setValue("images", [...(getValues("images") || []), data], { shouldValidate: true })}
                            />
                        </div>
                    </div>
                </div>

                {errors.images && (
                    <p className="text-xs text-destructive font-medium">{errors.images.message}</p>
                )}
            </div>

            {/* Amenities / Features Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Features & Amenities</FieldLabel>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cabFeatures.map((id) => (
                        <FormField
                            key={id}
                            control={control}
                            name="amenities"
                            render={({ field }) => (
                                <label className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                    field.value?.includes(id)
                                        ? "bg-primary/10 border-primary/40 text-primary"
                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]"
                                )}>
                                    <Checkbox
                                        className="hidden"
                                        checked={field.value?.includes(id)}
                                        onCheckedChange={(checked) => {
                                            const arr = field.value || [];
                                            field.onChange(checked ? [...arr, id] : arr.filter((v) => v !== id));
                                        }}
                                    />
                                    <span className="text-xs font-medium capitalize">{id.replace(/_/g, " ")}</span>
                                </label>
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Cab Company Permits / Documents</FieldLabel>
                </div>
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">{doc.docName}</span>
                                    <a href={doc.docUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary uppercase font-bold tracking-tight">View PDF</a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = documents[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "raw").catch(console.error);
                                    }
                                    setValue("documents", documents.filter((_, i) => i !== index));
                                }}
                                className="p-2 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <ImageField label="Upload Commercial Permit" onUploadSuccess={(data) => setValue("documents", [...documents, { docName: data.name, docUrl: data.url, public_id: data.public_id, resource_type: data.resource_type }])} />
                </div>
            </div>
        </FieldGroup>
    );
};


const bikeFeatures = [
    "helmet_included",
    "gps_tracking",
    "roadside_assistance",
    "phone_mount",
    "unlimited_kms",
    "insurance_included"
];

export const Step_3_bike = ({ methods }: { currentStep: number; methods: UseFormReturn<SignUpProps> }) => {
    const { register, formState: { errors }, watch, setValue, control, getValues } = methods;

    const [isLocating, setIsLocating] = useState(false);
    const [showDetailedAddress, setShowDetailedAddress] = useState(false);
    const logo = watch("logo");
    const images = watch("images") || [];
    const documents = watch("documents") || [];
    const location = watch("location") || { type: "Point", coordinates: [72.8777, 19.0760] };
    const inputClasses = "h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setValue("location", {
                    type: "Point",
                    coordinates: [longitude, latitude],
                }, { shouldValidate: true });

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();
                    const city = data.city || data.locality || "";
                    const stateVal = data.principalSubdivision || "";
                    const countryVal = data.countryName || "India";
                    const postalCode = data.postcode || "";
                    const areaName = data.locality || "";
                    const districtEntry = data.localityInfo?.administrative?.find(
                        (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
                    );
                    const district = districtEntry?.name || "";

                    setValue("hotelCity", city);
                    const fullAddress = [city, stateVal, countryVal].filter(Boolean).join(", ");
                    setValue("hotelAddress", fullAddress);

                    // Auto-fill structured address fields
                    if (areaName) setValue("areaName", areaName);
                    if (district) setValue("district", district);
                    setValue("state", stateVal);
                    if (postalCode) setValue("postalCode", postalCode);
                    setValue("country", countryVal);
                    setValue("formattedAddress", fullAddress);

                    toast.success("Location and address synced!");
                } catch (error) {
                    toast.error("Coordinates found, but failed to fetch address.");
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                setIsLocating(false);
                toast.error("Location access denied.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <FieldGroup className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Optional Company Logo */}
            <CompanyLogoField logo={logo} setValue={setValue} />

            {/* Bike Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-slate-200">Bike Rental Agency Name</FieldLabel>
                    </div>
                    <Input placeholder="e.g. Velocity Bikes & Scooters" {...register("name")} className={inputClasses} />
                </Field>

                <Field className="md:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <FieldLabel className="text-slate-200">Description / Policies</FieldLabel>
                        </div>
                        <AiDescriptionButton
                            name={watch("name")}
                            serviceType="bike"
                            city={watch("city") || (watch("address") as any)?.city}
                            state={watch("state") || (watch("address") as any)?.state}
                            amenities={(((watch as any)("features") || []) as string[])}
                            currentDescription={watch("description")}
                            onGenerated={(aiText) => setValue("description", aiText, { shouldValidate: true, shouldDirty: true })}
                        />
                    </div>
                    <textarea
                        {...register("description")}
                        placeholder="Describe your fleet, types of bikes, helmets/locks, rental terms..."
                        className={cn(inputClasses, "min-h-[100px] w-full rounded-md p-3 resize-none")}
                    />
                </Field>
            </div>

            <div className="h-px bg-white/5" />

            {/* Location Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <FieldLabel className="text-slate-200">Shop Location</FieldLabel>
                        <p className="text-xs text-muted-foreground">Select your bike pick-up shop or depot.</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLocating}
                        onClick={handleGetCurrentLocation}
                        className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all gap-2"
                    >
                        {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                        {isLocating ? "Locating..." : "Use Current Location"}
                    </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <LocationPicker
                        value={[location.coordinates[1], location.coordinates[0]]}
                        onChange={(coords) => setValue("location", { type: "Point", coordinates: [coords[1], coords[0]] })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Address" {...register("hotelAddress")} className={inputClasses} />
                    <Input placeholder="City" {...register("hotelCity")} className={inputClasses} />
                </div>

                {/* Detailed Address (Collapsible) */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">Detailed Address</span>
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 ml-auto", showDetailedAddress && "rotate-180")} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Add building name, landmark, and other details to help riders find your rental shop.
                    </p>

                    {showDetailedAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <Input placeholder="Building / Shop Name" {...register("buildingName")} className={inputClasses} />
                            <Input placeholder="Door / Floor Number" {...register("doorNumber")} className={inputClasses} />
                            <Input placeholder="Area / Locality" {...register("areaName")} className={inputClasses} />
                            <Input placeholder="District" {...register("district")} className={inputClasses} />
                            <Input placeholder="State" {...register("state")} className={inputClasses} />
                            <Input placeholder="Postal Code" {...register("postalCode")} className={inputClasses} />
                            <Input placeholder="Landmark (e.g. Near Bus Stand)" {...register("landmark")} className={inputClasses} />
                            <Input placeholder="Directions to reach" {...register("directions")} className={inputClasses} />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Media Gallery */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Bike Inventory & Shop Gallery</FieldLabel>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-white/[0.02]"
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                type="button"
                                onClick={() => {
                                    const target = images[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "image").catch(console.error);
                                    }
                                    setValue("images", images.filter((_, i) => i !== index), { shouldValidate: true });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <div className="aspect-square relative flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden">
                            <ImageField
                                label="Add Photo"
                                variant="grid"
                                multiple={true}
                                onUploadSuccess={(data) => setValue("images", [...(getValues("images") || []), data], { shouldValidate: true })}
                            />
                        </div>
                    </div>
                </div>

                {errors.images && (
                    <p className="text-xs text-destructive font-medium">{errors.images.message}</p>
                )}
            </div>

            {/* Features Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Features Offered</FieldLabel>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bikeFeatures.map((id) => (
                        <FormField
                            key={id}
                            control={control}
                            name="amenities"
                            render={({ field }) => (
                                <label className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                    field.value?.includes(id)
                                        ? "bg-primary/10 border-primary/40 text-primary"
                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]"
                                )}>
                                    <Checkbox
                                        className="hidden"
                                        checked={field.value?.includes(id)}
                                        onCheckedChange={(checked) => {
                                            const arr = field.value || [];
                                            field.onChange(checked ? [...arr, id] : arr.filter((v) => v !== id));
                                        }}
                                    />
                                    <span className="text-xs font-medium capitalize">{id.replace(/_/g, " ")}</span>
                                </label>
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Bike Rental Shop Permits / License</FieldLabel>
                </div>
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">{doc.docName}</span>
                                    <a href={doc.docUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary uppercase font-bold tracking-tight">View PDF</a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = documents[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "raw").catch(console.error);
                                    }
                                    setValue("documents", documents.filter((_, i) => i !== index));
                                }}
                                className="p-2 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <ImageField label="Upload Commercial Permit" onUploadSuccess={(data) => setValue("documents", [...documents, { docName: data.name, docUrl: data.url, public_id: data.public_id, resource_type: data.resource_type }])} />
                </div>
            </div>
        </FieldGroup>
    );
};


const tourFeatures = [
    "guided_tours",
    "meals_included",
    "hotel_booking",
    "airport_transfer",
    "custom_packages",
    "entry_tickets"
];

export const Step_3_tour = ({ methods }: { currentStep: number; methods: UseFormReturn<SignUpProps> }) => {
    const { register, formState: { errors }, watch, setValue, control, getValues } = methods;

    const [isLocating, setIsLocating] = useState(false);
    const [showDetailedAddress, setShowDetailedAddress] = useState(false);
    const logo = watch("logo");
    const images = watch("images") || [];
    const documents = watch("documents") || [];
    const location = watch("location") || { type: "Point", coordinates: [72.8777, 19.0760] };
    const inputClasses = "h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setValue("location", {
                    type: "Point",
                    coordinates: [longitude, latitude],
                }, { shouldValidate: true });

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();
                    // Auto-fill basic form fields
                    const city = data.city || data.locality || "";
                    const stateVal = data.principalSubdivision || "";
                    const countryVal = data.countryName || "India";
                    const postalCode = data.postcode || "";
                    const areaName = data.locality || "";
                    const districtEntry = data.localityInfo?.administrative?.find(
                        (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
                    );
                    const district = districtEntry?.name || "";

                    setValue("hotelCity", city);
                    const fullAddress = [city, stateVal, countryVal].filter(Boolean).join(", ");
                    setValue("hotelAddress", fullAddress);

                    // Auto-fill structured address fields
                    if (areaName) setValue("areaName", areaName);
                    if (district) setValue("district", district);
                    setValue("state", stateVal);
                    if (postalCode) setValue("postalCode", postalCode);
                    setValue("country", countryVal);
                    setValue("formattedAddress", fullAddress);

                    toast.success("Location and address synced!");
                } catch (error) {
                    toast.error("Coordinates found, but failed to fetch address.");
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                setIsLocating(false);
                toast.error("Location access denied.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <FieldGroup className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Optional Company Logo */}
            <CompanyLogoField logo={logo} setValue={setValue} />

            {/* Tour Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-slate-200">Tour Agency Name</FieldLabel>
                    </div>
                    <Input placeholder="e.g. Wanderlust Adventures & Tours" {...register("name")} className={inputClasses} />
                </Field>

                <Field className="md:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <FieldLabel className="text-slate-200">Description & Tour Highlights</FieldLabel>
                        </div>
                        <AiDescriptionButton
                            name={watch("name")}
                            serviceType="tour"
                            city={watch("city") || (watch("address") as any)?.city}
                            state={watch("state") || (watch("address") as any)?.state}
                            amenities={(((watch as any)("features") || []) as string[])}
                            currentDescription={watch("description")}
                            onGenerated={(aiText) => setValue("description", aiText, { shouldValidate: true, shouldDirty: true })}
                        />
                    </div>
                    <textarea
                        {...register("description")}
                        placeholder="Describe your tour packages, experienced guides, major destinations covered..."
                        className={cn(inputClasses, "min-h-[100px] w-full rounded-md p-3 resize-none")}
                    />
                </Field>
            </div>

            <div className="h-px bg-white/5" />

            {/* Location Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <FieldLabel className="text-slate-200">Agency Headquarters / Office</FieldLabel>
                        <p className="text-xs text-muted-foreground">Select your primary booking office location.</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLocating}
                        onClick={handleGetCurrentLocation}
                        className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all gap-2"
                    >
                        {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                        {isLocating ? "Locating..." : "Use Current Location"}
                    </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <LocationPicker
                        value={[location.coordinates[1], location.coordinates[0]]}
                        onChange={(coords) => setValue("location", { type: "Point", coordinates: [coords[1], coords[0]] })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Address" {...register("hotelAddress")} className={inputClasses} />
                    <Input placeholder="City" {...register("hotelCity")} className={inputClasses} />
                </div>

                {/* Detailed Address (Collapsible) */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">Detailed Address</span>
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 ml-auto", showDetailedAddress && "rotate-180")} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Add building name, landmark, and other details to help guests find your property easily.
                    </p>

                    {showDetailedAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <Input placeholder="Building / Office Name" {...register("buildingName")} className={inputClasses} />
                            <Input placeholder="Door / Floor Number" {...register("doorNumber")} className={inputClasses} />
                            <Input placeholder="Area / Locality" {...register("areaName")} className={inputClasses} />
                            <Input placeholder="District" {...register("district")} className={inputClasses} />
                            <Input placeholder="State" {...register("state")} className={inputClasses} />
                            <Input placeholder="Postal Code" {...register("postalCode")} className={inputClasses} />
                            <Input placeholder="Landmark (e.g. Near Central Mall)" {...register("landmark")} className={inputClasses} />
                            <Input placeholder="Directions to reach" {...register("directions")} className={inputClasses} />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Media Gallery */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Destinations & Agency Gallery</FieldLabel>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-white/[0.02]"
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                type="button"
                                onClick={() => {
                                    const target = images[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "image").catch(console.error);
                                    }
                                    setValue("images", images.filter((_, i) => i !== index), { shouldValidate: true });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <div className="aspect-square relative flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden">
                            <ImageField
                                label="Add Photo"
                                variant="grid"
                                multiple={true}
                                onUploadSuccess={(data) => setValue("images", [...(getValues("images") || []), data], { shouldValidate: true })}
                            />
                        </div>
                    </div>
                </div>

                {errors.images && (
                    <p className="text-xs text-destructive font-medium">{errors.images.message}</p>
                )}
            </div>

            {/* Features Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Services & Integrations</FieldLabel>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tourFeatures.map((id) => (
                        <FormField
                            key={id}
                            control={control}
                            name="amenities"
                            render={({ field }) => (
                                <label className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                    field.value?.includes(id)
                                        ? "bg-primary/10 border-primary/40 text-primary"
                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]"
                                )}>
                                    <Checkbox
                                        className="hidden"
                                        checked={field.value?.includes(id)}
                                        onCheckedChange={(checked) => {
                                            const arr = field.value || [];
                                            field.onChange(checked ? [...arr, id] : arr.filter((v) => v !== id));
                                        }}
                                    />
                                    <span className="text-xs font-medium capitalize">{id.replace(/_/g, " ")}</span>
                                </label>
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Tourism Operator License / Registration</FieldLabel>
                </div>
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">{doc.docName}</span>
                                    <a href={doc.docUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary uppercase font-bold tracking-tight">View PDF</a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = documents[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "raw").catch(console.error);
                                    }
                                    setValue("documents", documents.filter((_, i) => i !== index));
                                }}
                                className="p-2 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <ImageField label="Upload Operator License" onUploadSuccess={(data) => setValue("documents", [...documents, { docName: data.name, docUrl: data.url, public_id: data.public_id, resource_type: data.resource_type }])} />
                </div>
            </div>
        </FieldGroup>
    );
};


const adventureFeatures = [
    "certified_instructors",
    "safety_gear",
    "first_aid",
    "pick_up_service",
    "meals_included",
    "photos_videos"
];

export const Step_3_adventure = ({ methods }: { currentStep: number; methods: UseFormReturn<SignUpProps> }) => {
    const { register, formState: { errors }, watch, setValue, control, getValues } = methods;

    const [isLocating, setIsLocating] = useState(false);
    const [showDetailedAddress, setShowDetailedAddress] = useState(false);
    const logo = watch("logo");
    const images = watch("images") || [];
    const documents = watch("documents") || [];
    const location = watch("location") || { type: "Point", coordinates: [72.8777, 19.0760] };
    const adventureCategory = watch("adventureCategory") || "rafting";
    const inputClasses = "h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40";

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setValue("location", {
                    type: "Point",
                    coordinates: [longitude, latitude],
                }, { shouldValidate: true });

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();
                    const city = data.city || data.locality || "";
                    const stateVal = data.principalSubdivision || "";
                    const countryVal = data.countryName || "India";
                    const postalCode = data.postcode || "";
                    const areaName = data.locality || "";
                    const districtEntry = data.localityInfo?.administrative?.find(
                        (a: any) => a.description?.toLowerCase().includes("district") || a.order === 6
                    );
                    const district = districtEntry?.name || "";

                    setValue("hotelCity", city);
                    const fullAddress = [city, stateVal, countryVal].filter(Boolean).join(", ");
                    setValue("hotelAddress", fullAddress);

                    // Auto-fill structured address fields
                    if (areaName) setValue("areaName", areaName);
                    if (district) setValue("district", district);
                    setValue("state", stateVal);
                    if (postalCode) setValue("postalCode", postalCode);
                    setValue("country", countryVal);
                    setValue("formattedAddress", fullAddress);

                    toast.success("Location and address synced!");
                } catch (error) {
                    toast.error("Coordinates found, but failed to fetch address.");
                } finally {
                    setIsLocating(false);
                }
            },
            () => {
                setIsLocating(false);
                toast.error("Location access denied.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <FieldGroup className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Optional Company Logo */}
            <CompanyLogoField logo={logo} setValue={setValue} />

            {/* Adventure Center Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-slate-200">Adventure Club / Center Name</FieldLabel>
                    </div>
                    <Input placeholder="e.g. Himalayan Rafting Base Camp" {...register("name")} className={inputClasses} />
                </Field>

                <Field className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-primary" />
                        <FieldLabel className="text-slate-200">Adventure Category</FieldLabel>
                    </div>
                    <Select
                        onValueChange={(value) => setValue("adventureCategory", value)}
                        defaultValue={adventureCategory}
                    >
                        <SelectTrigger className="h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 text-white transition-all">
                            <SelectValue placeholder="Select adventure type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="rafting">River Rafting</SelectItem>
                            <SelectItem value="paragliding">Paragliding</SelectItem>
                            <SelectItem value="bungee">Bungee Jumping</SelectItem>
                            <SelectItem value="trekking">Trekking</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field className="md:col-span-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" />
                            <FieldLabel className="text-slate-200">Description & Safety Protocols</FieldLabel>
                        </div>
                        <AiDescriptionButton
                            name={watch("name")}
                            serviceType="adventure"
                            city={watch("city") || (watch("address") as any)?.city}
                            state={watch("state") || (watch("address") as any)?.state}
                            amenities={(((watch as any)("features") || []) as string[])}
                            currentDescription={watch("description")}
                            onGenerated={(aiText) => setValue("description", aiText, { shouldValidate: true, shouldDirty: true })}
                        />
                    </div>
                    <textarea
                        {...register("description")}
                        placeholder="Describe safety precautions, equipment quality, course difficulty, guides experience..."
                        className={cn(inputClasses, "min-h-[100px] w-full rounded-md p-3 resize-none")}
                    />
                </Field>
            </div>

            <div className="h-px bg-white/5" />

            {/* Location Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <FieldLabel className="text-slate-200">Adventure Site Location</FieldLabel>
                        <p className="text-xs text-muted-foreground">Select the coordinates of your start point / base camp.</p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLocating}
                        onClick={handleGetCurrentLocation}
                        className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all gap-2"
                    >
                        {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                        {isLocating ? "Locating..." : "Use Current Location"}
                    </Button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                    <LocationPicker
                        value={[location.coordinates[1], location.coordinates[0]]}
                        onChange={(coords) => setValue("location", { type: "Point", coordinates: [coords[1], coords[0]] })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Address" {...register("hotelAddress")} className={inputClasses} />
                    <Input placeholder="City" {...register("hotelCity")} className={inputClasses} />
                </div>

                {/* Detailed Address (Collapsible) */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-full"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-medium">Detailed Address</span>
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 ml-auto", showDetailedAddress && "rotate-180")} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                        Add base camp name, landmark, and other details to help adventurers find your camp easily.
                    </p>

                    {showDetailedAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                            <Input placeholder="Camp / Base Name" {...register("buildingName")} className={inputClasses} />
                            <Input placeholder="Door / Office Number" {...register("doorNumber")} className={inputClasses} />
                            <Input placeholder="Area / Locality" {...register("areaName")} className={inputClasses} />
                            <Input placeholder="District" {...register("district")} className={inputClasses} />
                            <Input placeholder="State" {...register("state")} className={inputClasses} />
                            <Input placeholder="Postal Code" {...register("postalCode")} className={inputClasses} />
                            <Input placeholder="Landmark (e.g. Near River Bridge)" {...register("landmark")} className={inputClasses} />
                            <Input placeholder="Directions to reach" {...register("directions")} className={inputClasses} />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Media Gallery */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Adventure Site / Action Gallery</FieldLabel>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-white/[0.02]"
                        >
                            <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button
                                type="button"
                                onClick={() => {
                                    const target = images[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "image").catch(console.error);
                                    }
                                    setValue("images", images.filter((_, i) => i !== index), { shouldValidate: true });
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}

                    <div className="aspect-square relative flex items-center justify-center">
                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden">
                            <ImageField
                                label="Add Photo"
                                variant="grid"
                                multiple={true}
                                onUploadSuccess={(data) => setValue("images", [...(getValues("images") || []), data], { shouldValidate: true })}
                            />
                        </div>
                    </div>
                </div>

                {errors.images && (
                    <p className="text-xs text-destructive font-medium">{errors.images.message}</p>
                )}
            </div>

            {/* Features Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Safety Features & Inclusions</FieldLabel>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {adventureFeatures.map((id) => (
                        <FormField
                            key={id}
                            control={control}
                            name="amenities"
                            render={({ field }) => (
                                <label className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                                    field.value?.includes(id)
                                        ? "bg-primary/10 border-primary/40 text-primary"
                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]"
                                )}>
                                    <Checkbox
                                        className="hidden"
                                        checked={field.value?.includes(id)}
                                        onCheckedChange={(checked) => {
                                            const arr = field.value || [];
                                            field.onChange(checked ? [...arr, id] : arr.filter((v) => v !== id));
                                        }}
                                    />
                                    <span className="text-xs font-medium capitalize">{id.replace(/_/g, " ")}</span>
                                </label>
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <FieldLabel className="text-slate-200">Adventure Club Permits / Safety Certifications</FieldLabel>
                </div>
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">{doc.docName}</span>
                                    <a href={doc.docUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary uppercase font-bold tracking-tight">View PDF</a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const target = documents[index];
                                    if (target?.public_id) {
                                        useAuthStore.getState().deleteFile(target.public_id, target.resource_type || "raw").catch(console.error);
                                    }
                                    setValue("documents", documents.filter((_, i) => i !== index));
                                }}
                                className="p-2 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <ImageField label="Upload Commercial Permit" onUploadSuccess={(data) => setValue("documents", [...documents, { docName: data.name, docUrl: data.url, public_id: data.public_id, resource_type: data.resource_type }])} />
                </div>
            </div>
        </FieldGroup>
    );
};
