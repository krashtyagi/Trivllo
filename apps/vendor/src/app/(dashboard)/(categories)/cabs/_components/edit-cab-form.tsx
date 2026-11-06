"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, X, Plus } from "lucide-react";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { CitySearchInput } from "@/components/city-search-input";
import { updateCabServices } from "@/services/fetch.service";
import { useGetCabServiceDetailsById } from "@/services/tanstack.query";
import { NewCabProps, NewCabSchema } from "../new/zod-schema";

const cabTypes = ["luxury", "standard", "premium", "economy", "suv"];

export default function EditCabForm({
  setEditMode,
  cabId,
}: {
  setEditMode?: React.Dispatch<React.SetStateAction<{ id: string; mode: boolean }>>;
  cabId: string;
}) {
  const { uploadFile, deleteFile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const { data: cabDetailsData, isLoading: detailsLoading } = useGetCabServiceDetailsById(cabId);

  const form = useForm<NewCabProps>({
    resolver: zodResolver(NewCabSchema),
    defaultValues: {
      title: "", pickupLocation: "", dropLocation: "", carName: "",
      cabType: "standard", capacity: 4, carNumber: "", images: [],
      description: "", features: [""], basePrice: 1000, discountPrice: 0,
      meta: { distance: "", duration: "" },
    },
    mode: "onChange",
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } =
    useFieldArray({ control: form.control, name: "features" as any });

  useEffect(() => {
    if (cabDetailsData?.data) {
      const d = cabDetailsData.data;

      // Map images from format string[] to { url, public_id, resource_type }[]
      const mappedImages = (d.images || []).map((img: any) => {
        if (typeof img === "string") {
          return { url: img, public_id: "", resource_type: "image" };
        }
        return {
          url: img.url || "",
          public_id: img.public_id || "",
          resource_type: img.resource_type || "image"
        };
      });

      form.reset({
        title: d.title || "",
        pickupLocation: d.route?.pickup || "",
        dropLocation: d.route?.drop || "",
        carName: d.car?.name || "",
        cabType: d.car?.type || "standard",
        capacity: d.car?.capacity || 4,
        carNumber: d.car?.number || "",
        images: mappedImages,
        description: d.description || "",
        features: d.features || [""],
        basePrice: d.pricing?.basePrice || 1000,
        discountPrice: d.pricing?.discountPrice || 0,
        meta: {
          distance: d.meta?.distance || "",
          duration: d.meta?.duration || "",
        },
      });
    }
  }, [cabDetailsData, form]);

  useEffect(() => { return () => { previews.forEach((url) => URL.revokeObjectURL(url)); }; }, [previews]);

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
        if (result?.url) {
          newUrls.push({ url: result.url, public_id: result.public_id || "", resource_type: result.resource_type || "image" });
          toast.success(`Uploaded: ${file.name}`);
        } else { throw new Error("Incomplete upload data received"); }
      } catch (err) { console.error("Upload failed:", file.name, err); toast.error(`Failed to upload ${file.name}`); }
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
        console.error("Failed to delete cab image from Cloudinary:", err);
      });
    }

    setPreviews((prev) => { URL.revokeObjectURL(prev[index]); return prev.filter((_: any, i: number) => i !== index); });
    form.setValue("images", current.filter((_: any, i: number) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: NewCabProps) => {
    setLoading(true);
    try {
      await updateCabServices(cabId, data);
      toast.success("Cab updated successfully!");
      if (setEditMode) {
        setEditMode({ id: "", mode: false });
      }
    } catch (err) { console.error(err); toast.error("Failed to update cab"); }
    finally { setLoading(false); }
  };

  if (detailsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold">Edit Cab</CardTitle>
            {setEditMode && (
              <Button type="button" variant="outline" onClick={() => setEditMode((v) => ({ ...v, mode: false }))}>Close</Button>
            )}
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <Accordion type="multiple" defaultValue={["images", "basic", "route", "features"]}>
              {/* ── Images ── */}
              <AccordionItem value="images">
                <AccordionTrigger>Cab Images</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      {form.watch("images").map((img: any, idx: number) => (
                        <div key={img.url} className="relative group">
                          <div className="h-28 w-40 rounded-xl overflow-hidden border shadow-sm">
                            <Image src={img.url} alt={`Cab image ${idx + 1}`} width={160} height={112} className="object-cover" />
                          </div>
                          <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-card text-white rounded-full z-4 p-1.5 shadow-md hover:bg-destructive/90" disabled={uploading}><X size={16} /></button>
                        </div>
                      ))}
                      <label className={`h-28 w-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
                        <Input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} disabled={uploading} />
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
                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="Rishikesh to Dehradun Airport Ride" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="carName" render={({ field }) => (<FormItem><FormLabel>Car Name *</FormLabel><FormControl><Input {...field} placeholder="Toyota Innova Crysta" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="cabType" render={({ field }) => (<FormItem><FormLabel>Cab Type *</FormLabel><FormControl><select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">{cabTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>Seating Capacity *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="carNumber" render={({ field }) => (<FormItem><FormLabel>Car Number *</FormLabel><FormControl><Input {...field} placeholder="UK07 IN 9999" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₹) *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description *</FormLabel><FormControl><Textarea {...field} placeholder="Describe the cab service, comfort, amenities..." className="min-h-32" /></FormControl><FormMessage /></FormItem>)} />
                </AccordionContent>
              </AccordionItem>

              {/* ── Route & Meta ── */}
              <AccordionItem value="route">
                <AccordionTrigger>Route & Details</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="pickupLocation" render={({ field }) => (<FormItem><FormLabel>Pickup Location *</FormLabel><FormControl><CitySearchInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Search pickup city..." /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="dropLocation" render={({ field }) => (<FormItem><FormLabel>Drop Location *</FormLabel><FormControl><CitySearchInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Search drop city..." /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meta.distance" render={({ field }) => (<FormItem><FormLabel>Distance *</FormLabel><FormControl><Input {...field} placeholder="35 km" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meta.duration" render={({ field }) => (<FormItem><FormLabel>Duration *</FormLabel><FormControl><Input {...field} placeholder="1.5 hours" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Features ── */}
              <AccordionItem value="features">
                <AccordionTrigger>Features</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Cab Features</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendFeature("" as any)}>Add Feature</Button>
                  </div>
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end border-b pb-4">
                      <FormField control={form.control} name={`features.${index}`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Feature {index + 1}</FormLabel><FormControl><Input {...field} placeholder="e.g. AC, Extra Luggage Space..." /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="ghost" size="icon" className="mb-2" onClick={() => removeFeature(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator className="my-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" size="lg" disabled={loading || uploading} className="flex-1">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Cab"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => { if (setEditMode) setEditMode({ id: "", mode: false }); }} disabled={loading || uploading}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
