"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, X, Plus } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

import { NewBikeProps, NewBikeSchema } from "./zod-schema";
import { addbikeService } from "@/services/fetch.service";
import { PageSkeleton } from "../../rooms/_components/details.skeleton";
import { useCurrentUser } from "@/services/queryes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const bikeTypes = ["scooter", "cruiser", "sports", "standard"];
const fuelTypes = ["petrol", "electric"];
const gearTypes = ["Manual", "Automatic"];

const AddBikeForm = ({ setEditMode, }: {
  setEditMode?: React.Dispatch<
    React.SetStateAction<{ id: string; mode: boolean }>
  >;
}) => {
  const { uploadFile, deleteFile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const { data } = useCurrentUser();
  const form = useForm<NewBikeProps>({
    resolver: zodResolver(NewBikeSchema),
    defaultValues: {
      bikeId: data?.data?.serviceDetails?.id,
      title: "",
      bikeName: "",
      bikeType: "standard",
      engineCC: 150,
      fuelType: "petrol",
      pricePerDay: 500,
      discountPrice: 0,
      maxDurationDays: 7,
      description: "",
      features: [""],
      images: [],
      meta: {
        mileage: "",
        gearType: "Manual",
      },
    },
    mode: "onChange",
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({ control: form.control, name: "features" as any });

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    const id = data?.data?.approvedData?.bikeId || data?.data?.serviceDetails?.id;
    if (id) {
      form.setValue("bikeId", id);
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
          newUrls.push({
            url: result.url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
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
    form.setValue("images", [...current, ...newUrls], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const current = form.getValues("images") || [];
    const target = current[index];
    if (target?.public_id) {
      deleteFile(target.public_id, target.resource_type || "image").catch((err) => {
        console.error("Failed to delete bike image from Cloudinary:", err);
      });
    }

    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });

    form.setValue(
      "images",
      current.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true }
    );
  };
  const router = useRouter();
  const onSubmit = async (data: NewBikeProps) => {
    setLoading(true);
    try {
      await addbikeService(data);
      toast.success("Bike created successfully!");
      form.reset();
      setPreviews([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create bike");
    } finally {
      setLoading(false);
      router.push("/bikes");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
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
        className="space-y-6 pb-12"
      >
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold">Add New Bike</CardTitle>
            {setEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMode((v) => ({ ...v, mode: false }))}
              >
                Close
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <Accordion type="multiple" defaultValue={["images", "basic", "specs", "features"]}>
              {/* ── Images ─────────────────────────────────────── */}
              <AccordionItem value="images">
                <AccordionTrigger>Bike Images</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      {form.watch("images").map((img, idx) => (
                        <div key={img.url} className="relative group">
                          <div className="h-28 w-40 rounded-xl overflow-hidden border shadow-sm">
                            <Image
                              src={img.url}
                              alt={`Bike image ${idx + 1}`}
                              width={160}
                              height={112}
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-card text-white rounded-full z-4 p-1.5 shadow-md hover:bg-destructive/90"
                            disabled={uploading}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}

                      <label
                        className={`h-28 w-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all ${uploading ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                      >
                        <Input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={uploading}
                        />
                        {uploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                          <>
                            <Plus size={28} className="text-muted-foreground" />
                            <span className="mt-2 text-sm font-medium text-muted-foreground">
                              Add Images
                            </span>
                          </>
                        )}
                      </label>
                    </div>

                    {form.formState.errors.images && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.images.message}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Basic Information ─────────────────────────── */}
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Yamaha R15 Sports Bike Rental" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bikeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bike Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Yamaha R15 V4" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bikeType"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Bike Type *</FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select bike type" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {bikeTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricePerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Per Day (₹) *</FormLabel>
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
                          <FormLabel>Discount Price (₹)</FormLabel>
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
                      name="maxDurationDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Rental Duration (Days) *</FormLabel>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the bike, its condition, features..."
                            className="min-h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ── Specifications ────────────────────────────── */}
              <AccordionItem value="specs">
                <AccordionTrigger>Specifications</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <FormField
                      control={form.control}
                      name="engineCC"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Engine CC *</FormLabel>
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
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Fuel Type *</FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {fuelTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meta.mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="40 kmpl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meta.gearType"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Gear Type *</FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select gear type" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {gearTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Features ──────────────────────────────────── */}
              <AccordionItem value="features">
                <AccordionTrigger>Features</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Bike Features</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFeature("" as any)}
                    >
                      Add Feature
                    </Button>
                  </div>

                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end border-b pb-4">
                      <FormField
                        control={form.control}
                        name={`features.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Feature {index + 1}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. High Speed, Sporty Design..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-2"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator className="my-8" />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={loading || uploading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Bike"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  form.reset();
                  setPreviews([]);
                }}
                disabled={loading || uploading}
              >
                Reset Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

export default function Page() {
  return (
    <AddBikeForm />
  )
}
