"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

import { amenityIconMap } from "@/components/icons";
import { NewRoomProps, NewRoomSchema } from "../new/zod-schema";
import { RoomImageArranger } from "./room-image-arranger";

export default function AddRoomForm({
  setEditMode,
  hotelId,
  roomId,
}: {
  setEditMode?: React.Dispatch<
    React.SetStateAction<{ id: string; mode: boolean }>
  >;
  hotelId: string;
  roomId: string;
}) {
  const { uploadFile, deleteFile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]); // local blob URLs (temporary)
  const form = useForm<NewRoomProps>({
    resolver: zodResolver(NewRoomSchema),
    defaultValues: {
      hotelId,
      name: "family room",
      description: "",
      basePrice: 1000,
      discountPrice: 0,
      capacity:{ adults: 2, children: 0 },
      beds: [{ type: "double", quantity: 1 }],
      amenities: [],
      roomSizeSqm: 25,
      viewType: "",
      images: [],
      totalRooms: 1,
      isActive: true,
    },
    mode: "onChange",
  });



  const { fields: bedFields, append: appendBed, remove: removeBed } =
    useFieldArray({ control: form.control, name: "beds" });

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    setUploading(true);

    // 1. Create instant local previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // 2. Upload files
    const newUrls: { url: string; public_id: string; resource_type: string }[] = [];

    for (const file of files) {
      try {
        const result = await uploadFile(file);
        if (result?.url) {
          newUrls.push({
            url: result.url,
            public_id: result?.public_id as string || "",
            resource_type: result?.resource_type as string || "",
          });
          toast.success(`Uploaded: ${file.name}`);
        } else {
          throw new Error("No URL returned");
        }
      } catch (err) {
        console.error("Upload failed:", file.name, err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // 3. Update form with **uploaded URLs** (this is what gets submitted)
    const current = form.getValues("images") || [];
    form.setValue("images", [...current, ...newUrls], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setUploading(false);
    e.target.value = ""; // allow re-select same file
  };

  const removeImage = (index: number) => {
    const current = form.getValues("images") || [];
    const target = current[index];
    if (target?.public_id) {
      deleteFile(target.public_id, target.resource_type || "image").catch((err) => {
        console.error("Failed to delete room image from Cloudinary:", err);
      });
    }

    // Remove preview
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });

    // Remove from form values (secure URLs)
    form.setValue(
      "images",
      current.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: NewRoomProps) => {
    setLoading(true);
    try {


      toast.success("Room created successfully!");
      form.reset();
      setPreviews([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold">Add New Room</CardTitle>
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
            <Accordion type="multiple" defaultValue={["images", "basic", "capacity", "amenities"]}>
              {/* ── Images ─────────────────────────────────────── */}
              <AccordionItem value="images">
                <AccordionTrigger>Room Images & Layout Arrangement</AccordionTrigger>
                <AccordionContent>
                  <RoomImageArranger
                    images={form.watch("images") || []}
                    onChange={(newImages) =>
                      form.setValue("images", newImages, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    onUpload={handleImageChange}
                    onRemove={removeImage}
                    uploading={uploading}
                    errorMessage={form.formState.errors.images?.message}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ── Basic Info ─────────────────────────────────── */}
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Name / Type *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Deluxe King Room" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roomSizeSqm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (sqm) *</FormLabel>
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
                      name="totalRooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Available Rooms *</FormLabel>
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
                      name="viewType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>View Type</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ocean, Garden, City..." />
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
                          <FormLabel>Base Price (₹) *</FormLabel>
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
                            placeholder="Describe the room, furniture, view, special features..."
                            className="min-h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              {/* //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
              {/* ── Capacity & Beds ────────────────────────────── */}
              <AccordionItem value="capacity">
                <AccordionTrigger>Capacity & Beds</AccordionTrigger>
                <AccordionContent className="space-y-8 pt-4">
                  {/* Capacity */}
                  <div className="space-y-4">
                    

                      <div className="flex gap-4 items-end border-b pb-4">
                        <FormField
                          control={form.control}
                          name={`capacity.adults`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Adults</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`capacity.children`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Children</FormLabel>
                              <FormControl>
                                <Input type="number"  {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                      </div>
                  </div>

                  {/* Beds */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Bed Configurations</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendBed({ type: "double", quantity: 1 })}
                      >
                        Add Bed Type
                      </Button>
                    </div>

                    {bedFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-end border-b pb-4">
                        <FormField
                          control={form.control}
                          name={`beds.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Bed Type</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="King, Queen, Twin..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`beds.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
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
                          onClick={() => removeBed(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ── Amenities ──────────────────────────────────── */}
              <AccordionItem value="amenities">
                <AccordionTrigger>Amenities & Features</AccordionTrigger>
                <AccordionContent>
                  {/* You can keep or adapt your CheckboxGrid component here */}
                  {/* Example placeholder */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4">
                    {["wifi", "ac", "tv", "minibar", "coffee", "safe", "balcony"].map((id) => (
                      <FormField
                        key={id}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(id)}
                                onCheckedChange={(checked) => {
                                  const arr = field.value || [];
                                  field.onChange(
                                    checked ? [...arr, id] : arr.filter((v) => v !== id)
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">{id.replace("_", " ")}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator className="my-8" />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={loading || uploading

                }
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Room"
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

// CheckboxGrid remains unchanged — keeping your version
type CheckboxGridProps = {
  name: "amenities" | "accessibilityFeatures" | "view";
  label: string;
  items: { id: string; label: string }[];
  control: any;
};

function CheckboxGrid({ name, label, items, control }: CheckboxGridProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <Label className="text-lg font-semibold">{label}</Label>
        <Input
          placeholder={`Filter ${label.toLowerCase()}...`}
          className="max-w-[260px] h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-5 rounded-xl border bg-muted/5">
        {filtered.map((item) => {
          const Icon = amenityIconMap?.[item.id];
          return (
            <FormField
              key={item.id}
              control={control}
              name={name}
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item.id)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        field.onChange(
                          checked
                            ? [...current, item.id]
                            : current.filter((v: string) => v !== item.id)
                        );
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    {item.label}
                  </FormLabel>
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}