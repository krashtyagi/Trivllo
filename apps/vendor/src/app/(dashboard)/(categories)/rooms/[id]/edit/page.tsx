"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  BedDouble,
  Maximize2,
  Users,
  Hotel,
  Eye,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { useDeleteRoomType } from "@/services/tanstack.query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { useCurrentUser } from "@/services/queryes";
import { getRoomById, updateRoomType } from "@/services/fetch.service";
import { NewRoomProps, NewRoomSchema } from "../../new/zod-schema";
import { amenityIconMap } from "@/components/icons";
import { RoomImageArranger } from "../../_components/room-image-arranger";
import { axiosApi } from "@/lib/axios";
import { AiDescriptionButton } from "@/components/ai-description-button";

export const availableAmenities = Object.keys(amenityIconMap);

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = params?.id;
  const roomId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const hotelId =
    userData?.data?.approvedData?.hotelId ||
    userData?.data?.serviceDetails?.id ||
    "";

  const { uploadFile } = useAuthStore();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [amenitySearch, setAmenitySearch] = useState("");
  const [propertyCustomAmenities, setPropertyCustomAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteRoomMutation = useDeleteRoomType();

  const handleDeleteRoom = () => {
    if (!roomId) return;
    deleteRoomMutation.mutate(roomId, {
      onSuccess: () => {
        toast.success("Room deleted successfully");
        setIsDeleteDialogOpen(false);
        router.push("/rooms");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete room");
      },
    });
  };

  const form = useForm<NewRoomProps>({
    resolver: zodResolver(NewRoomSchema),
    defaultValues: {
      hotelId: "",
      name: "",
      description: "",
      basePrice: 1000,
      discountPrice: 0,
      capacity: { adults: 2, children: 0 },
      beds: [{ type: "double", quantity: 1 }],
      amenities: [],
      roomSizeSqm: 25,
      viewType: "city",
      images: [],
      totalRooms: 1,
      isActive: true,
    },
    mode: "onChange",
  });

  const {
    fields: bedFields,
    append: appendBed,
    remove: removeBed,
  } = useFieldArray({
    control: form.control,
    name: "beds",
  });

  // Fetch initial room data
  useEffect(() => {
    if (!roomId || !hotelId) return;

    let isMounted = true;
    setIsLoadingData(true);

    getRoomById(roomId, hotelId)
      .then((res: any) => {
        if (!isMounted) return;
        const room = res?.data;
        if (!room) {
          toast.error("Could not load room details");
          return;
        }

        form.reset({
          hotelId: room.hotelId || hotelId,
          name: room.name || "",
          description: room.description || "",
          basePrice: room.basePrice || room.price || 1000,
          discountPrice: room.discountPrice || 0,
          capacity: {
            adults: room.capacity?.adults ?? 2,
            children: room.capacity?.children ?? 0,
          },
          beds: room.beds?.length
            ? room.beds.map((b: any) => ({
                type: b.type || "double",
                quantity: b.quantity || 1,
              }))
            : [{ type: "double", quantity: 1 }],
          amenities: room.amenities || [],
          roomSizeSqm: room.roomSizeSqm || 25,
          viewType: room.viewType || "none",
          images: (room.images || []).map((img: any) => ({
            url: img.url,
            public_id: img.public_id || "",
            resource_type: img.resource_type || "image",
          })),
          totalRooms: room.totalRooms || 1,
          isActive: room.isActive !== false,
        });
      })
      .catch((err: any) => {
        toast.error("Failed to load room type details");
      })
      .finally(() => {
        if (isMounted) setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [roomId, hotelId, form]);

  // Load custom/active amenities from property settings
  useEffect(() => {
    axiosApi
      .get("/vendors/property-settings")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data?.amenities)) {
          setPropertyCustomAmenities((prev) =>
            Array.from(new Set([...prev, ...res.data.data.amenities]))
          );
        }
      })
      .catch(() => {});
  }, []);

  const selectedAmenities = form.watch("amenities") || [];

  const allAvailableAmenities = useMemo(() => {
    const set = new Set<string>([
      ...availableAmenities,
      ...propertyCustomAmenities,
      ...selectedAmenities,
    ]);
    return Array.from(set);
  }, [propertyCustomAmenities, selectedAmenities]);

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (!trimmed) return;
    if (!propertyCustomAmenities.includes(trimmed)) {
      setPropertyCustomAmenities((prev) => [...prev, trimmed]);
    }
    if (!selectedAmenities.includes(trimmed)) {
      form.setValue("amenities", [...selectedAmenities, trimmed], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setCustomAmenityInput("");
    toast.success(`Amenity "${trimmed.replace(/_/g, " ")}" added to room!`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploading(true);

    const newUrls: { url: string; public_id: string; resource_type: string }[] =
      [];

    for (const file of files) {
      try {
        const result = await uploadFile(file, "rooms");
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
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const onSubmit = async (values: NewRoomProps) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        hotelId: hotelId || values.hotelId,
      };

      const res = await updateRoomType(roomId, payload);
      if (res?.success || res?.status === 200 || res?.data) {
        queryClient.invalidateQueries({ queryKey: ["user-getDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-roomTypes"] });
        queryClient.invalidateQueries({ queryKey: ["user-getCalender"] });
        toast.success("Room type updated successfully!");
        router.push("/rooms");
      } else {
        throw new Error(res?.message || "Failed to update room type");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to save room changes",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData || userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading room details...</p>
      </div>
    );
  }

  const images = form.watch("images") || [];

  return (
    <div className="w-full space-y-6 pb-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rooms")}
            className="rounded-xl h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Edit Room Listing
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update room pricing, capacity, amenities, and gallery photos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isSubmitting || deleteRoomMutation.isPending}
            className="text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Room
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/rooms")}
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
          <Tabs defaultValue="basic" className="w-full space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1.5 bg-muted/60 rounded-2xl border border-border/60 gap-1.5">
              <TabsTrigger
                value="basic"
                className="rounded-xl py-2 px-3 text-xs font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <Hotel className="h-4 w-4 text-primary" />
                <span>Basic & Pricing</span>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="rounded-xl py-2 px-3 text-xs font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <UploadCloud className="h-4 w-4 text-primary" />
                <span>Room Photos</span>
                {images.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {images.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="capacity"
                className="rounded-xl py-2 px-3 text-xs font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <Users className="h-4 w-4 text-primary" />
                <span>Capacity & Beds</span>
              </TabsTrigger>
              <TabsTrigger
                value="amenities"
                className="rounded-xl py-2 px-3 text-xs font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Amenities</span>
                {selectedAmenities.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {selectedAmenities.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Basic Details & Pricing Tab ─────────────────── */}
            <TabsContent value="basic" className="space-y-6 pt-2">
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-primary" />
                    Basic Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Title, descriptions, and operational room status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Room Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Deluxe Ocean View Suite"
                              {...field}
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
                          <FormLabel className="text-xs font-semibold">
                            View Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select view type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None / Standard</SelectItem>
                              <SelectItem value="city">City View</SelectItem>
                              <SelectItem value="garden">Garden View</SelectItem>
                              <SelectItem value="sea">Sea / Ocean View</SelectItem>
                              <SelectItem value="mountain">
                                Mountain View
                              </SelectItem>
                              <SelectItem value="pool">Pool View</SelectItem>
                              <SelectItem value="courtyard">
                                Courtyard View
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                        <div className="flex items-center justify-between pb-1">
                          <FormLabel className="text-xs font-semibold">
                            Description
                          </FormLabel>
                          <AiDescriptionButton
                            name={form.watch("name") || "Hotel Room"}
                            serviceType="hotel room"
                            amenities={selectedAmenities}
                            context={`Size: ${form.watch("roomSizeSqm")} sqm, View: ${form.watch("viewType")}, Capacity: ${form.watch("capacity.adults")} adults`}
                            currentDescription={field.value}
                            onGenerated={(aiText) =>
                              form.setValue("description", aiText, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                          />
                        </div>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Detailed room features, views, and unique offerings..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-semibold cursor-pointer">
                            Active for public booking
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Inventory */}
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-primary" />
                    Pricing & Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Base Price (₹/night)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                          <FormLabel className="text-xs font-semibold">
                            Discounted Price (₹)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Optional"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
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
                          <FormLabel className="text-xs font-semibold">
                            Total Inventory
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
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
                          <FormLabel className="text-xs font-semibold">
                            Size (Sqm)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Room Photos Tab ─────────────────────────────── */}
            <TabsContent value="images" className="space-y-4 pt-2">
              <RoomImageArranger
                images={images}
                onChange={(newImages) =>
                  form.setValue("images", newImages, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                onUpload={handleImageUpload}
                onRemove={removeImage}
                uploading={uploading}
                errorMessage={form.formState.errors.images?.message}
              />
            </TabsContent>

            {/* ── Capacity & Beds Tab ─────────────────────────── */}
            <TabsContent value="capacity" className="space-y-4 pt-2">
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Capacity & Beds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    <FormField
                      control={form.control}
                      name="capacity.adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Adults Max
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capacity.children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Children Max
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Bed Arrangements
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => appendBed({ type: "double", quantity: 1 })}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Bed
                      </Button>
                    </div>

                    {bedFields.map((fieldItem, index) => (
                      <div key={fieldItem.id} className="flex items-center gap-3">
                        <FormField
                          control={form.control}
                          name={`beds.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Bed Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="king">King Bed</SelectItem>
                                  <SelectItem value="queen">Queen Bed</SelectItem>
                                  <SelectItem value="double">Double Bed</SelectItem>
                                  <SelectItem value="single">Single Bed</SelectItem>
                                  <SelectItem value="twin">Twin Beds</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`beds.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="w-28">
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {bedFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-9 w-9"
                            onClick={() => removeBed(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Amenities Tab ───────────────────────────────── */}
            <TabsContent value="amenities" className="space-y-4 pt-2">
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Room Amenities & Features
                        {selectedAmenities.length > 0 && (
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {selectedAmenities.length} selected
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Choose verified hotel amenities or add custom room features below.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Filter amenities..."
                        value={amenitySearch}
                        onChange={(e) => setAmenitySearch(e.target.value)}
                        className="max-w-[180px] text-xs h-8"
                      />
                    </div>
                  </div>

                  {/* Custom Amenity Adder */}
                  <div className="flex items-center gap-2 max-w-sm pt-2">
                    <Input
                      placeholder="Add custom room amenity (e.g. jacuzzi)..."
                      value={customAmenityInput}
                      onChange={(e) => setCustomAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomAmenity();
                        }
                      }}
                      className="text-xs h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomAmenity}
                      className="text-xs h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                    >
                      <Plus className="h-3 w-3" />
                      Add Custom
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-2">
                    {allAvailableAmenities
                      .filter((a) =>
                        a.toLowerCase().includes(amenitySearch.toLowerCase()),
                      )
                      .map((amenity) => {
                        const isChecked = selectedAmenities.includes(amenity);
                        const isCustom = !availableAmenities.includes(amenity);
                        return (
                          <label
                            key={amenity}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                                : "bg-card border-border hover:bg-muted/40 text-foreground"
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  form.setValue("amenities", [
                                    ...selectedAmenities,
                                    amenity,
                                  ]);
                                } else {
                                  form.setValue(
                                    "amenities",
                                    selectedAmenities.filter((a) => a !== amenity),
                                  );
                                }
                              }}
                            />
                            <span className="capitalize truncate">
                              {amenity.replace(/_/g, " ")}
                            </span>
                            {isCustom && (
                              <Badge variant="secondary" className="ml-auto text-[9px] px-1 py-0 h-4 uppercase font-semibold">
                                Custom
                              </Badge>
                            )}
                          </label>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isSubmitting || deleteRoomMutation.isPending}
              className="text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Room
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/rooms")}
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
          </div>
        </form>
      </Form>

      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteRoom}
        serviceName={form.watch("name") || "room"}
        isLoading={deleteRoomMutation.isPending}
      />
    </div>
  );
}
