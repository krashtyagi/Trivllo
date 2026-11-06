"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, X, Plus, Search, Check } from "lucide-react";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { CitySearchInput } from "@/components/city-search-input";
import { NewTourProps, NewTourSchema } from "./zod-schema";
import { addTourService } from "@/services/fetch.service";
import { useCurrentUser } from "@/services/queryes";
import { useRouter } from "next/navigation";
import { TourFeatures, TourAmenities } from "@/components/icons";
import { PageSkeleton } from "../../rooms/_components/details.skeleton";

export default function Page() {
  return (
    <AddTourForm />
  )
}

const extractFormErrors = (errObj: any, prefix = ""): string[] => {
  if (!errObj || typeof errObj !== "object") return [];
  if ("message" in errObj && typeof errObj.message === "string" && errObj.message) {
    return [prefix ? `${prefix}: ${errObj.message}` : errObj.message];
  }
  return Object.entries(errObj).flatMap(([key, val]) => {
    const formattedKey = !isNaN(Number(key)) ? `Day ${Number(key) + 1}` : key;
    const newPrefix = prefix ? `${prefix} -> ${formattedKey}` : formattedKey;
    return extractFormErrors(val, newPrefix);
  });
};

const formatLabel = (key: string) => {
  return key
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AddTourForm = ({
  setEditMode,
}: {
  setEditMode?: React.Dispatch<React.SetStateAction<{ id: string; mode: boolean }>>;
}) => {
  const { uploadFile, deleteFile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [tourTypeSearch, setTourTypeSearch] = useState("");
  const [amenitySearch, setAmenitySearch] = useState("");
  const { data, isLoading } = useCurrentUser();

  const tourCompanyId =
    data?.data?.approvedData?.tourId ||
    data?.data?.approvedData?.companyId ||
    data?.data?.serviceDetails?.id ||
    data?.data?.serviceDetails?._id ||
    "";

  const form = useForm<NewTourProps>({
    resolver: zodResolver(NewTourSchema),
    defaultValues: {
      tourId: tourCompanyId ? String(tourCompanyId) : "",
      title: "",
      destinations: [""],
      duration: { days: 1, nights: 0 },
      basePrice: 1000,
      discountPrice: 0,
      description: "",
      tourType: [],
      amenities: [],
      features: [""],
      images: [],
      itinerary: [{ day: 1, title: "", description: "", highlights: [""] }],
      meta: { hotelType: "", transport: "", mealPlan: "" },
      maxPeople: 10,
    },
    mode: "onChange",
  });

  const { fields: destFields, append: appendDest, remove: removeDest } =
    useFieldArray({ control: form.control, name: "destinations" as any });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } =
    useFieldArray({ control: form.control, name: "features" as any });
  const { fields: itinFields, append: appendItin, remove: removeItin } =
    useFieldArray({ control: form.control, name: "itinerary" });

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    const id =
      data?.data?.approvedData?.tourId ||
      data?.data?.approvedData?.companyId ||
      data?.data?.serviceDetails?.id ||
      data?.data?.serviceDetails?._id;
    if (id) {
      form.setValue("tourId", String(id), { shouldValidate: true });
    }
  }, [data, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    const newUrls: { url: string; public_id: string; resource_type: string }[] = [];
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        if (result?.url && result?.public_id && result?.resource_type) {
          newUrls.push({ url: result.url, public_id: result.public_id, resource_type: result.resource_type });
          toast.success(`Uploaded: ${file.name}`);
        } else {
          throw new Error("Incomplete upload data received");
        }
      } catch (err) {
        console.error("Upload failed:", file.name, err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    const current = form.getValues("images") || [];
    form.setValue("images", [...current, ...newUrls], { shouldValidate: true, shouldDirty: true });
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const current = form.getValues("images") || [];
    const target = current[index];
    if (target?.public_id) {
      deleteFile(target.public_id, target.resource_type || "image").catch((err) => {
        console.error("Failed to delete tour image from Cloudinary:", err);
      });
    }

    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    form.setValue("images", current.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  const router = useRouter();

  const selectedTourTypes = form.watch("tourType") || [];
  const selectedAmenities = form.watch("amenities") || [];

  const toggleTourType = (key: string) => {
    const current = form.getValues("tourType") || [];
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    form.setValue("tourType", updated, { shouldValidate: true, shouldDirty: true });
  };

  const toggleAmenity = (key: string) => {
    const current = form.getValues("amenities") || [];
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    form.setValue("amenities", updated, { shouldValidate: true, shouldDirty: true });
  };

  const filteredTourTypes = Object.entries(TourFeatures).filter(([key]) =>
    formatLabel(key).toLowerCase().includes(tourTypeSearch.toLowerCase()) ||
    key.toLowerCase().includes(tourTypeSearch.toLowerCase())
  );

  const filteredAmenities = Object.entries(TourAmenities).filter(([key]) =>
    formatLabel(key).toLowerCase().includes(amenitySearch.toLowerCase()) ||
    key.toLowerCase().includes(amenitySearch.toLowerCase())
  );

  const onSubmit = async (formData: NewTourProps) => {
    setLoading(true);
    try {
      const activeTourId =
        formData.tourId ||
        data?.data?.approvedData?.tourId ||
        data?.data?.approvedData?.companyId ||
        data?.data?.serviceDetails?.id ||
        data?.data?.serviceDetails?._id;

      if (!activeTourId) {
        toast.error("Tour Company ID not found. Please make sure your tour vendor registration is approved.");
        setLoading(false);
        return;
      }

      // Filter out empty strings from array fields
      const cleanedFeatures = (formData.features || []).filter((f) => f && f.trim().length > 0);
      const cleanedDestinations = (formData.destinations || []).filter((d) => d && d.trim().length > 0);

      await addTourService({
        ...formData,
        tourId: String(activeTourId),
        features: cleanedFeatures,
        destinations: cleanedDestinations,
      });
      toast.success("Tour created successfully!");
      form.reset();
      setPreviews([]);
      router.push("/tours");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to create tour");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !tourCompanyId) {
    return <PageSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Validation errors:", errors);
          const errorMessages = extractFormErrors(errors);
          const errorMsg =
            errorMessages.length > 0 ? errorMessages.join(", ") : "Please check all required fields.";
          toast.error(`Form validation failed: ${errorMsg}`);
        })}
        className="space-y-6 pb-12"
      >
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold">Add New Tour</CardTitle>
            {setEditMode && (
              <Button type="button" variant="outline" onClick={() => setEditMode((v) => ({ ...v, mode: false }))}>Close</Button>
            )}
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <Accordion type="multiple" defaultValue={["images", "basic", "destinations", "tourType", "amenities", "itinerary", "features", "meta"]}>
              {/* ── Images ── */}
              <AccordionItem value="images">
                <AccordionTrigger>Tour Images</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      {form.watch("images").map((img, idx) => (
                        <div key={img.url} className="relative group">
                          <div className="h-28 w-40 rounded-xl overflow-hidden border shadow-sm">
                            <Image src={img.url} alt={`Tour image ${idx + 1}`} width={160} height={112} className="object-cover" />
                          </div>
                          <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-card text-white rounded-full z-4 p-1.5 shadow-md hover:bg-destructive/90" disabled={uploading}><X size={16} /></button>
                        </div>
                      ))}
                      <label className={`h-28 w-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <Input type="file"
                          multiple
                          className="hidden" onChange={handleImageChange} disabled={uploading} />
                        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <><Plus size={28} className="text-muted-foreground" /><span className="mt-2 text-sm font-medium text-muted-foreground">Add Images</span></>}
                      </label>
                    </div>
                    {form.formState.errors.images && <p className="text-sm text-destructive">{form.formState.errors.images.message}</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Basic Info ── */}
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="Rishikesh Adventure & Camping Trip" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₹) *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="duration.days" render={({ field }) => (<FormItem><FormLabel>Days *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="duration.nights" render={({ field }) => (<FormItem><FormLabel>Nights *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="maxPeople" render={({ field }) => (<FormItem><FormLabel>Max People *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description *</FormLabel><FormControl><Textarea {...field} placeholder="Describe the tour package, highlights, what's included..." className="min-h-32" /></FormControl><FormMessage /></FormItem>)} />
                </AccordionContent>
              </AccordionItem>

              {/* ── Destinations ── */}
              <AccordionItem value="destinations">
                <AccordionTrigger>Destinations</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Tour Destinations</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendDest("" as any)}>Add Destination</Button>
                  </div>
                  {destFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end border-b pb-4">
                      <FormField control={form.control} name={`destinations.${index}`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Destination {index + 1}</FormLabel><FormControl><CitySearchInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Search destination city..." /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="ghost" size="icon" className="mb-2" onClick={() => removeDest(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* ── Tour Types (Categories/Style) ── */}
              <AccordionItem value="tourType">
                <AccordionTrigger>Tour Types ({selectedTourTypes.length} selected)</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <p className="text-sm text-muted-foreground">Select the activity types and styles that best describe this tour.</p>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tour types..."
                        value={tourTypeSearch}
                        onChange={(e) => setTourTypeSearch(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  {selectedTourTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-muted/40 rounded-xl border">
                      <span className="text-xs font-semibold text-muted-foreground mr-1 self-center">Selected:</span>
                      {selectedTourTypes.map((key) => (
                        <Badge key={key} variant="secondary" className="gap-1 px-2.5 py-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => toggleTourType(key)}>
                          {formatLabel(key)}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 border rounded-xl">
                    {filteredTourTypes.map(([key, Icon]) => {
                      const active = selectedTourTypes.includes(key);
                      return (
                        <Button
                          key={key}
                          type="button"
                          variant={active ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTourType(key)}
                          className="rounded-full flex items-center gap-1.5 px-3 py-1.5 h-auto text-xs transition-all"
                        >
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                          <span>{formatLabel(key)}</span>
                          {active && <Check className="h-3 w-3 ml-0.5" />}
                        </Button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Inclusions & Amenities ── */}
              <AccordionItem value="amenities">
                <AccordionTrigger>Inclusions & Amenities ({selectedAmenities.length} selected)</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <p className="text-sm text-muted-foreground">Select what is provided or included in this tour package.</p>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search amenities..."
                        value={amenitySearch}
                        onChange={(e) => setAmenitySearch(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  {selectedAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-muted/40 rounded-xl border">
                      <span className="text-xs font-semibold text-muted-foreground mr-1 self-center">Selected:</span>
                      {selectedAmenities.map((key) => (
                        <Badge key={key} variant="secondary" className="gap-1 px-2.5 py-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={() => toggleAmenity(key)}>
                          {formatLabel(key)}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1 border rounded-xl">
                    {filteredAmenities.map(([key, Icon]) => {
                      const active = selectedAmenities.includes(key);
                      return (
                        <Button
                          key={key}
                          type="button"
                          variant={active ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAmenity(key)}
                          className="rounded-full flex items-center gap-1.5 px-3 py-1.5 h-auto text-xs transition-all"
                        >
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                          <span>{formatLabel(key)}</span>
                          {active && <Check className="h-3 w-3 ml-0.5" />}
                        </Button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Itinerary ── */}
              <AccordionItem value="itinerary">
                <AccordionTrigger>Itinerary</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Day-wise Itinerary</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendItin({ day: itinFields.length + 1, title: "", description: "", highlights: [""] })}>Add Day</Button>
                  </div>
                  {itinFields.map((field, index) => (
                    <Card key={field.id} className="p-4 space-y-4 border-dashed">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold">Day {index + 1}</Label>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItin(index)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`itinerary.${index}.day`} render={({ field }) => (<FormItem><FormLabel>Day Number</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Day Title *</FormLabel><FormControl><Input {...field} placeholder="Arrival & Camp Setup" /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Day Description *</FormLabel><FormControl><Textarea {...field} placeholder="Describe what happens on this day..." className="min-h-20" /></FormControl><FormMessage /></FormItem>)} />
                      <HighlightsField control={form.control} itineraryIndex={index} />
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* ── Custom Features ── */}
              <AccordionItem value="features">
                <AccordionTrigger>Custom Highlights & Notes</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Custom Features</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendFeature("" as any)}>Add Feature</Button>
                  </div>
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end border-b pb-4">
                      <FormField control={form.control} name={`features.${index}`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Feature {index + 1}</FormLabel><FormControl><Input {...field} placeholder="e.g. Bonfire & Music night, Riverside camp..." /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="ghost" size="icon" className="mb-2" onClick={() => removeFeature(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* ── Meta ── */}
              <AccordionItem value="meta">
                <AccordionTrigger>Additional Details</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormField control={form.control} name="meta.hotelType" render={({ field }) => (<FormItem><FormLabel>Hotel/Stay Type *</FormLabel><FormControl><Input {...field} placeholder="Camp, Hotel, Resort..." /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meta.transport" render={({ field }) => (<FormItem><FormLabel>Transport *</FormLabel><FormControl><Input {...field} placeholder="Shared Cab, Private Bus..." /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meta.mealPlan" render={({ field }) => (<FormItem><FormLabel>Meal Plan *</FormLabel><FormControl><Input {...field} placeholder="MAP, AP, CP..." /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator className="my-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" size="lg" disabled={loading || uploading} className="flex-1">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Tour"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setPreviews([]); }} disabled={loading || uploading}>Reset Form</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

// Sub-component for itinerary highlights
function HighlightsField({ control, itineraryIndex }: { control: any; itineraryIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `itinerary.${itineraryIndex}.highlights` as any,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Highlights</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => append("" as any)}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>
      {fields.map((field, hIdx) => (
        <div key={field.id} className="flex gap-2 items-center">
          <FormField control={control} name={`itinerary.${itineraryIndex}.highlights.${hIdx}`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} placeholder="e.g. Camp Stay, Bonfire..." /></FormControl><FormMessage /></FormItem>)} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(hIdx)}><X className="h-3 w-3" /></Button>
        </div>
      ))}
    </div>
  );
}
