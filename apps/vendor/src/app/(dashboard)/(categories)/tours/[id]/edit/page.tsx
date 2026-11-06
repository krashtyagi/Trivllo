"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Loader2,
  X,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  CalendarDays,
  Clock,
  MapPin,
  Mountain,
  Sparkles,
  Users,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { getTourServiceDetailsById, updateTourService } from "@/services/fetch.service";
import { NewTourProps, NewTourSchema } from "../../new/zod-schema";
import { TourFeatures, TourAmenities } from "@/components/icons";

const formatLabel = (key: string) => {
  return key
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const tourId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const { uploadFile } = useAuthStore();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tourTypeSearch, setTourTypeSearch] = useState("");
  const [amenitySearch, setAmenitySearch] = useState("");

  const form = useForm<NewTourProps>({
    resolver: zodResolver(NewTourSchema),
    defaultValues: {
      tourId: "",
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

  const { fields: destFields, append: appendDest, remove: removeDest } = useFieldArray({
    control: form.control,
    name: "destinations" as any,
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features" as any,
  });

  const { fields: itinFields, append: appendItin, remove: removeItin } = useFieldArray({
    control: form.control,
    name: "itinerary",
  });

  // Fetch initial tour data
  useEffect(() => {
    if (!tourId) return;

    let isMounted = true;
    setIsLoadingData(true);

    getTourServiceDetailsById(tourId)
      .then((res: any) => {
        if (!isMounted) return;
        const tour = res?.data;
        if (!tour) {
          toast.error("Could not load tour details");
          return;
        }

        form.reset({
          tourId: tour.tour?._id || tour.tour || "",
          title: tour.title || "",
          destinations: tour.destinations?.length ? tour.destinations : [""],
          duration: {
            days: tour.duration?.days ?? 1,
            nights: tour.duration?.nights ?? 0,
          },
          basePrice: tour.pricing?.basePrice ?? tour.basePrice ?? 1000,
          discountPrice: tour.pricing?.discountPrice ?? tour.discountPrice ?? 0,
          description: tour.description || "",
          tourType: tour.tourType || [],
          amenities: tour.amenities || [],
          features: tour.features?.length ? tour.features : [""],
          images: (tour.images || []).map((img: any) => ({
            url: img.url,
            public_id: img.public_id || "",
            resource_type: img.resource_type || "image",
          })),
          itinerary: tour.itinerary?.length
            ? tour.itinerary.map((it: any, idx: number) => ({
                day: it.day || idx + 1,
                title: it.title || `Day ${idx + 1}`,
                description: it.description || "",
                highlights: it.highlights?.length ? it.highlights : [""],
              }))
            : [{ day: 1, title: "", description: "", highlights: [""] }],
          meta: {
            hotelType: tour.meta?.hotelType || "",
            transport: tour.meta?.transport || "",
            mealPlan: tour.meta?.mealPlan || "",
          },
          maxPeople: tour.maxPeople || 10,
        });
      })
      .catch((err: any) => {
        toast.error("Failed to load tour service details");
      })
      .finally(() => {
        if (isMounted) setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tourId, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploading(true);

    const newUrls: { url: string; public_id: string; resource_type: string }[] = [];

    for (const file of files) {
      try {
        const result = await uploadFile(file, "tours");
        if (result?.url) {
          newUrls.push({
            url: result.url,
            public_id: (result.public_id as string) || "",
            resource_type: (result.resource_type as string) || "image",
          });
          toast.success(`Uploaded: ${file.name}`);
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    const currentImages = form.getValues("images") || [];
    form.setValue("images", [...currentImages, ...newUrls], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const onSubmit = async (values: NewTourProps) => {
    setIsSubmitting(true);
    try {
      const res = await updateTourService(tourId, values);
      if (res?.success || res?.status === 200 || res?.data) {
        toast.success("Tour package updated successfully!");
        router.push("/tours");
      } else {
        throw new Error(res?.message || "Failed to update tour package");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to save tour changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading tour package details...</p>
      </div>
    );
  }

  const images = form.watch("images") || [];
  const selectedTourTypes = form.watch("tourType") || [];
  const selectedAmenities = form.watch("amenities") || [];

  return (
    <div className="w-full space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/tours")}
            className="rounded-xl h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Edit Tour Package
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update tour itinerary, inclusions, pricing, and destination highlights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/tours")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || uploading}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Overview */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Mountain className="h-4 w-4 text-primary" />
                Package Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Package Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5 Days Serene Kashmir Valley Exploration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Comprehensive summary of what travellers will experience..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destinations */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Destinations Covered
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => appendDest("")}
                  >
                    <Plus className="h-3 w-3" />
                    Add City
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {destFields.map((fieldItem, index) => (
                    <div key={fieldItem.id} className="flex items-center gap-1.5">
                      <FormField
                        control={form.control}
                        name={`destinations.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="City / Stop" {...field} className="text-xs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {destFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeDest(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Duration */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Duration & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="duration.days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration.nights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Nights</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Base Price (₹/person)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Discounted Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPeople"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Max Group Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inclusions Meta Info */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Hotel, Transport & Meal Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="meta.hotelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Hotel Standard</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 4 Star Luxury / Boutique Resort" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta.transport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Transport Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Private AC Sedan / SUV" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta.mealPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Meal Plan</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Breakfast & Dinner Included" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tour Types Badges */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Tour Category Types</CardTitle>
              <div className="pt-2">
                <Input
                  placeholder="Filter tour categories..."
                  value={tourTypeSearch}
                  onChange={(e) => setTourTypeSearch(e.target.value)}
                  className="max-w-xs text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {Object.keys(TourFeatures)
                  .filter((key) => key.toLowerCase().includes(tourTypeSearch.toLowerCase()))
                  .map((typeKey) => {
                    const isSelected = selectedTourTypes.includes(typeKey);
                    const IconComp = (TourFeatures as any)[typeKey];
                    return (
                      <button
                        type="button"
                        key={typeKey}
                        onClick={() => {
                          if (isSelected) {
                            form.setValue(
                              "tourType",
                              selectedTourTypes.filter((t) => t !== typeKey)
                            );
                          } else {
                            form.setValue("tourType", [...selectedTourTypes, typeKey]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/40 hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {IconComp && <IconComp className="h-3.5 w-3.5" />}
                        <span>{formatLabel(typeKey)}</span>
                      </button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Amenities & Inclusions */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Inclusions & Amenities</CardTitle>
              <div className="pt-2">
                <Input
                  placeholder="Filter inclusions..."
                  value={amenitySearch}
                  onChange={(e) => setAmenitySearch(e.target.value)}
                  className="max-w-xs text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {Object.keys(TourAmenities)
                  .filter((key) => key.toLowerCase().includes(amenitySearch.toLowerCase()))
                  .map((amenityKey) => {
                    const isSelected = selectedAmenities.includes(amenityKey);
                    const IconComp = (TourAmenities as any)[amenityKey];
                    return (
                      <button
                        type="button"
                        key={amenityKey}
                        onClick={() => {
                          if (isSelected) {
                            form.setValue(
                              "amenities",
                              selectedAmenities.filter((a) => a !== amenityKey)
                            );
                          } else {
                            form.setValue("amenities", [...selectedAmenities, amenityKey]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-muted/40 hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {IconComp && <IconComp className="h-3.5 w-3.5" />}
                        <span>{formatLabel(amenityKey)}</span>
                      </button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Itinerary */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Daily Itinerary
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define schedule, activities, and highlights for each day.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() =>
                    appendItin({
                      day: itinFields.length + 1,
                      title: `Day ${itinFields.length + 1}`,
                      description: "",
                      highlights: [""],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Day
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="multiple" defaultValue={["item-0"]} className="w-full space-y-3">
                {itinFields.map((fieldItem, index) => (
                  <AccordionItem
                    key={fieldItem.id}
                    value={`item-${index}`}
                    className="border rounded-xl px-4 bg-card shadow-sm"
                  >
                    <AccordionTrigger className="hover:no-underline py-3 text-sm font-semibold">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                          Day {index + 1}
                        </Badge>
                        <span className="truncate max-w-sm">
                          {form.watch(`itinerary.${index}.title`) || `Day ${index + 1}`}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                      <FormField
                        control={form.control}
                        name={`itinerary.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Day Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Arrival in Srinagar & Dal Lake Shikara Ride" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`itinerary.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Day Description</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Schedule and plan for the day..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {itinFields.length > 1 && (
                        <div className="flex justify-end pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 text-xs h-7 gap-1"
                            onClick={() => removeItin(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove Day {index + 1}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Tour Gallery Images
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Showcase key attractions, stays, and activities (at least 5 images recommended).
                  </CardDescription>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-colors">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-3.5 w-3.5" />
                    )}
                    Upload Photos
                  </span>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-xs">
                  No images uploaded yet. Click &quot;Upload Photos&quot; to add tour photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="group relative aspect-video rounded-xl overflow-hidden border bg-muted">
                      <img
                        src={img.url}
                        alt={`Tour photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/tours")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
