"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, X, Plus, Mountain, Wind, Zap, MapPin } from "lucide-react";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { useCurrentUser } from "@/services/queryes";
import { addAdventureService } from "@/services/fetch.service";

import {
  DistanceServiceSchema, TimeServiceSchema, FixedServiceSchema, PackageServiceSchema,
  type DistanceServiceProps, type TimeServiceProps, type FixedServiceProps, type PackageServiceProps,
  type ServiceType,
} from "./zod-schema";
import { useRouter } from "next/navigation";

const SERVICE_TABS: { key: ServiceType; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "distance", label: "rafting", icon: <MapPin className="h-5 w-5" />, desc: "Distance based" },
  { key: "time", label: "paragliding", icon: <Wind className="h-5 w-5" />, desc: "Time based" },
  { key: "fixed", label: "bungee", icon: <Zap className="h-5 w-5" />, desc: "Fixed price" },
  { key: "package", label: "trekking", icon: <Mountain className="h-5 w-5" />, desc: "Package based" },
];
function useImageUpload(form: any) {
  const { uploadFile, deleteFile } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => { return () => { previews.forEach((url) => URL.revokeObjectURL(url)); }; }, [previews]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    const newUrls: { url: string; public_id: string; resource_type: string }[] = [];
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        if (result?.url && result?.public_id && result?.resource_type) {
          newUrls.push({ url: result.url, public_id: result.public_id, resource_type: result.resource_type });
          toast.success(`Uploaded: ${file.name}`);
        } else throw new Error("Incomplete upload data");
      } catch (err) { console.error(err); toast.error(`Failed to upload ${file.name}`); }
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
        console.error("Failed to delete adventure image from Cloudinary:", err);
      });
    }

    setPreviews((prev) => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index); });
    form.setValue("images", current.filter((_: any, i: number) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  return { uploading, previews, setPreviews, handleImageChange, removeImage };
}
function ImagesSection({ form, uploading, handleImageChange, removeImage }: any) {
  return (
    <AccordionItem value="images">
      <AccordionTrigger>Service Images</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {(form.watch("images") || []).map((img: any, idx: number) => (
              <div key={img.url} className="relative group">
                <div className="h-28 w-40 rounded-xl overflow-hidden border shadow-sm">
                  <Image src={img.url} alt={`Image ${idx + 1}`} width={160} height={112} className="object-cover" />
                </div>
                <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-card text-white rounded-full z-4 p-1.5 shadow-md hover:bg-destructive/90" disabled={uploading}>
                  <X size={16} />
                </button>
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
  );
}
function FeaturesSection({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "features" as any });
  return (
    <AccordionItem value="features">
      <AccordionTrigger>Features</AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Service Features</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append("" as any)}>Add Feature</Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end border-b pb-4">
            <FormField control={form.control} name={`features.${index}`} render={({ field }) => (
              <FormItem className="flex-1"><FormLabel>Feature {index + 1}</FormLabel><FormControl><Input {...field} placeholder="e.g. Expert Guide, Safety Team..." /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="button" variant="ghost" size="icon" className="mb-2" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
function DistanceForm({ adventureId }: { adventureId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<DistanceServiceProps>({
    resolver: zodResolver(DistanceServiceSchema),
    defaultValues: { adventureId, title: "", type: "distance", basePrice: 0, discountPrice: 0, meta: { distance: "", duration: "" }, features: [""], images: [] },
    mode: "onChange",
  });
  const imgHook = useImageUpload(form);

  useEffect(() => {
    if (adventureId) {
      form.setValue("adventureId", adventureId);
    }
  }, [adventureId, form]);

  const onSubmit = async (data: DistanceServiceProps) => {
    setLoading(true);
    try { await addAdventureService(data); toast.success("Rafting service created!"); form.reset(); imgHook.setPreviews([]); }
    catch (err) { console.error(err); toast.error("Failed to create service"); }
    finally {
      setLoading(false);

      router.push("/adventures");
    }
  };

  return (
    <Form {...form} >
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Rafting validation errors:", errors);
          const errorMsg = Object.entries(errors)
            .map(([key, err]) => {
              if (err && typeof err === 'object' && 'message' in err) {
                return `${key}: ${err.message}`;
              }
              return `${key}: Invalid value`;
            })
            .join(", ");
          toast.error(`Form validation failed: ${errorMsg}`);
        })}
        className="space-y-6"
      >
        <Accordion type="multiple" defaultValue={["images", "basic", "meta", "features"]}>
          <ImagesSection form={form} {...imgHook} />
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="16KM Rafting" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₹) *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="meta">
            <AccordionTrigger>Distance & Duration</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="meta.distance" render={({ field }) => (<FormItem><FormLabel>Distance *</FormLabel><FormControl><Input {...field} placeholder="16KM" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="meta.duration" render={({ field }) => (<FormItem><FormLabel>Duration *</FormLabel><FormControl><Input {...field} placeholder="3-4 hours" /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <FeaturesSection form={form} />
        </Accordion>
        <SubmitButtons loading={loading} uploading={imgHook.uploading} form={form} setPreviews={imgHook.setPreviews} label="Create Rafting Service" />
      </form>
    </Form>
  );
}
function TimeForm({ adventureId }: { adventureId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<TimeServiceProps>({
    resolver: zodResolver(TimeServiceSchema),
    defaultValues: { adventureId, title: "", type: "time", basePrice: 0, discountPrice: 0, meta: { duration: "" }, features: [""], images: [] },
    mode: "onChange",
  });
  const imgHook = useImageUpload(form);

  useEffect(() => {
    if (adventureId) {
      form.setValue("adventureId", adventureId);
    }
  }, [adventureId, form]);

  const onSubmit = async (data: TimeServiceProps) => {
    setLoading(true);
    try { await addAdventureService(data); toast.success("Paragliding service created!"); form.reset(); imgHook.setPreviews([]); }
    catch (err) { console.error(err); toast.error("Failed to create service"); }
    finally {
      setLoading(false);
      router.push("/adventures");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Paragliding validation errors:", errors);
          const errorMsg = Object.entries(errors)
            .map(([key, err]) => {
              if (err && typeof err === 'object' && 'message' in err) {
                return `${key}: ${err.message}`;
              }
              return `${key}: Invalid value`;
            })
            .join(", ");
          toast.error(`Form validation failed: ${errorMsg}`);
        })}
        className="space-y-6"
      >
        <Accordion type="multiple" defaultValue={["images", "basic", "meta", "features"]}>
          <ImagesSection form={form} {...imgHook} />
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="20 Min Long Flight" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₹) *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="meta">
            <AccordionTrigger>Duration</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="meta.duration" render={({ field }) => (<FormItem><FormLabel>Duration *</FormLabel><FormControl><Input {...field} placeholder="20 min" /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <FeaturesSection form={form} />
        </Accordion>
        <SubmitButtons loading={loading} uploading={imgHook.uploading} form={form} setPreviews={imgHook.setPreviews} label="Create Paragliding Service" />
      </form>
    </Form>
  );
}
function FixedForm({ adventureId }: { adventureId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FixedServiceProps>({
    resolver: zodResolver(FixedServiceSchema),
    defaultValues: { adventureId, title: "", type: "fixed", basePrice: 0, discountPrice: 0, features: [""], images: [] },
    mode: "onChange",
  });
  const imgHook = useImageUpload(form);

  useEffect(() => {
    if (adventureId) {
      form.setValue("adventureId", adventureId);
    }
  }, [adventureId, form]);

  const onSubmit = async (data: FixedServiceProps) => {
    setLoading(true);
    try { await addAdventureService(data); toast.success("Bungee service created!"); form.reset(); imgHook.setPreviews([]); }
    catch (err) { console.error(err); toast.error("Failed to create service"); }
    finally {
      setLoading(false);
      router.push("/adventures");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Bungee validation errors:", errors);
          const errorMsg = Object.entries(errors)
            .map(([key, err]) => {
              if (err && typeof err === 'object' && 'message' in err) {
                return `${key}: ${err.message}`;
              }
              return `${key}: Invalid value`;
            })
            .join(", ");
          toast.error(`Form validation failed: ${errorMsg}`);
        })}
        className="space-y-6"
      >
        <Accordion type="multiple" defaultValue={["images", "basic", "features"]}>
          <ImagesSection form={form} {...imgHook} />
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="Standard Bungee Jump" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₹) *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <FeaturesSection form={form} />
        </Accordion>
        <SubmitButtons loading={loading} uploading={imgHook.uploading} form={form} setPreviews={imgHook.setPreviews} label="Create Bungee Service" />
      </form>
    </Form>
  );
}
function PackageForm({ adventureId }: { adventureId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<PackageServiceProps>({
    resolver: zodResolver(PackageServiceSchema),
    defaultValues: { adventureId, title: "", type: "package", basePrice: 0, discountPrice: 0, meta: { days: 1, nights: 0 }, features: [""], images: [], itinerary: [{ day: 1, title: "", description: "" }] },
    mode: "onChange",
  });
  const imgHook = useImageUpload(form);
  const { fields: itinFields, append: appendItin, remove: removeItin } = useFieldArray({ control: form.control, name: "itinerary" });

  useEffect(() => {
    if (adventureId) {
      form.setValue("adventureId", adventureId);
    }
  }, [adventureId, form]);

  const onSubmit = async (data: PackageServiceProps) => {
    setLoading(true);
    try { await addAdventureService(data); toast.success("Trekking package created!"); form.reset(); imgHook.setPreviews([]); }
    catch (err) { console.error(err); toast.error("Failed to create service"); }
    finally {
      setLoading(false);
      router.push("/adventures");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Trekking validation errors:", errors);
          const errorMsg = Object.entries(errors)
            .map(([key, err]) => {
              if (err && typeof err === 'object' && 'message' in err) {
                return `${key}: ${err.message}`;
              }
              return `${key}: Invalid value`;
            })
            .join(", ");
          toast.error(`Form validation failed: ${errorMsg}`);
        })}
        className="space-y-6"
      >
        <Accordion type="multiple" defaultValue={["images", "basic", "meta", "itinerary", "features"]}>
          <ImagesSection form={form} {...imgHook} />
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} placeholder="Kheerganga Premium Trek Package" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price (₹) *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="discountPrice" render={({ field }) => (<FormItem><FormLabel>Discount Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="meta">
            <AccordionTrigger>Package Duration</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="meta.days" render={({ field }) => (<FormItem><FormLabel>Days *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="meta.nights" render={({ field }) => (<FormItem><FormLabel>Nights *</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="itinerary">
            <AccordionTrigger>Itinerary</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Day-wise Itinerary</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendItin({ day: itinFields.length + 1, title: "", description: "" })}>Add Day</Button>
              </div>
              {itinFields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-4 border-dashed">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Day {index + 1}</Label>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItin(index)}><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`itinerary.${index}.day`} render={({ field }) => (<FormItem><FormLabel>Day Number</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`itinerary.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Day Title *</FormLabel><FormControl><Input {...field} placeholder="Arrival & Trek Start" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name={`itinerary.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description *</FormLabel><FormControl><Textarea {...field} placeholder="Describe the day..." className="min-h-20" /></FormControl><FormMessage /></FormItem>)} />
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
          <FeaturesSection form={form} />
        </Accordion>
        <SubmitButtons loading={loading} uploading={imgHook.uploading} form={form} setPreviews={imgHook.setPreviews} label="Create Trekking Package" />
      </form>
    </Form>
  );
}

function SubmitButtons({ loading, uploading, form, setPreviews, label }: any) {
  return (
    <>
      <Separator className="my-8" />
      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="submit" size="lg" disabled={loading || uploading} className="flex-1">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : label}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setPreviews([]); }} disabled={loading || uploading}>
          Reset Form
        </Button>
      </div>
    </>
  );
}

export default function Page() {
  const { data: d } = useCurrentUser();
  const catss = d?.data?.serviceDetails?.category?.toLowerCase();
  const [activeTab, setActiveTab] = useState<ServiceType>();
  const adventureId = d?.data?.serviceDetails?.id || "";

  useEffect(() => {
    if (catss) {
      if (catss === "rafting") {
        setActiveTab("distance");
      } else if (catss === "paragliding") {
        setActiveTab("time");
      } else if (catss === "bungee") {
        setActiveTab("fixed");
      } else if (catss === "trekking") {
        setActiveTab("package");
      }
    }
  }, [catss]);

  return (
    <div className="space-y-6 pb-12">
      <Card className="rounded-2xl border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Adventure Service</CardTitle>
          <p className="text-muted-foreground text-sm">Select adventure type and fill the form</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* ── Tabs ── */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SERVICE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${activeTab === tab.key
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted hover:border-primary/40 hover:bg-muted/50"
                  }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {tab.icon}
                </div>
                <span className={`text-sm font-semibold ${activeTab === tab.key ? "text-primary" : "text-foreground"}`}>{tab.label}</span>
                <span className="text-xs text-muted-foreground">{tab.desc}</span>
                {activeTab === tab.key && <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
              </button>
            ))}
          </div> */}

          <Separator />

          {/* ── Dynamic Form ── */}
          {activeTab === "distance" && <DistanceForm adventureId={adventureId} />}
          {activeTab === "time" && <TimeForm adventureId={adventureId} />}
          {activeTab === "fixed" && <FixedForm adventureId={adventureId} />}
          {activeTab === "package" && <PackageForm adventureId={adventureId} />}
        </CardContent>
      </Card>
    </div>
  );
}
