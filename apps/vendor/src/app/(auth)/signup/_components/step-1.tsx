"use client";

import { useState } from "react";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { serviceTypeEnumProps, SignUpProps } from "@/schema/auth";
import ImageField from "./image-input";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Step_1 = ({
  methods,
}: {
  currentStep: number;
  methods: UseFormReturn<SignUpProps>;
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const cityVal = data.city || data.locality || "";
          const stateVal = data.principalSubdivision || "";
          const countryVal = data.countryName || "India";
          const fullAddress = [cityVal, stateVal, countryVal].filter(Boolean).join(", ");

          if (cityVal) setValue("city", cityVal, { shouldValidate: true });
          if (stateVal) setValue("state", stateVal, { shouldValidate: true });
          if (countryVal) setValue("country", countryVal, { shouldValidate: true });
          if (fullAddress) setValue("businessAddress", fullAddress, { shouldValidate: true });

          toast.success("Business location auto-filled!");
        } catch (error) {
          toast.error("Failed to fetch address from coordinates.");
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
    <FieldGroup className="space-y-8 animate-in fade-in duration-500">
      {/* Business Identity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field className="md:col-span-1">
          <FieldLabel>Service Type</FieldLabel>
          <Select
            onValueChange={(value) => setValue("serviceType", value as serviceTypeEnumProps)}
            defaultValue=""
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              {/* <SelectItem value="cab">Cab</SelectItem> */}
              <SelectItem value="tour">Tour</SelectItem>
              {/* <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem> */}
            </SelectContent>
          </Select>
          {errors.serviceType && <p className="text-xs font-medium text-destructive mt-1.5">{errors.serviceType.message}</p>}
        </Field>

        <Field className="md:col-span-1">
          <FieldLabel htmlFor="businessName">Business Name</FieldLabel>
          <Input
            id="businessName"
            placeholder="e.g. Grand Plaza"
            {...register("businessName")}
            className={cn("h-11", errors.businessName && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.businessName && <p className="text-xs font-medium text-destructive mt-1.5">{errors.businessName.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="businessEmail">Business Email</FieldLabel>
          <Input
            id="businessEmail"
            type="email"
            placeholder="contact@business.com"
            {...register("businessEmail")}
            className={cn("h-11", errors.businessEmail && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.businessEmail && <p className="text-xs font-medium text-destructive mt-1.5">{errors.businessEmail.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="businessPhone">Business Phone</FieldLabel>
          <Input
            id="businessPhone"
            type="tel"
            placeholder="+91 98765 43210"
            {...register("businessPhone")}
            className={cn("h-11", errors.businessPhone && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.businessPhone && <p className="text-xs font-medium text-destructive mt-1.5">{errors.businessPhone.message}</p>}
        </Field>
      </div>

      <hr className="border-border" />

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Location</h3>
            <p className="text-xs text-muted-foreground">Enter the registered address of your business.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLocating}
            onClick={handleGetCurrentLocation}
            className="gap-2 text-xs h-8"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            {isLocating ? "Locating..." : "Use Current Location"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field className="md:col-span-3">
            <FieldLabel htmlFor="businessAddress">Full Address</FieldLabel>
            <Input
              id="businessAddress"
              placeholder="Street, Landmark..."
              {...register("businessAddress")}
              className={cn("h-11", errors.businessAddress && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.businessAddress && <p className="text-xs font-medium text-destructive mt-1.5">{errors.businessAddress.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" placeholder="Bengaluru" {...register("city")} className="h-11" />
          </Field>

          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input id="state" placeholder="Karnataka" {...register("state")} className="h-11" />
          </Field>

          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input id="country" placeholder="India" {...register("country")} className="h-11" />
          </Field>
        </div>
      </div>

      <hr className="border-border" />

      {/* Verification Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legal Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel htmlFor="panNumber">PAN Number</FieldLabel>
            <Input id="panNumber" placeholder="ABCDE1234F" {...register("panNumber")} className="h-11 uppercase" />
            {errors.panNumber && <p className="text-xs font-medium text-destructive mt-1.5">{errors.panNumber.message}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="aadhaarNumber">Aadhaar Number</FieldLabel>
            <Input id="aadhaarNumber" placeholder="1234 5678 9012" {...register("aadhaarNumber")} className="h-11" />
            {errors.aadhaarNumber && <p className="text-xs font-medium text-destructive mt-1.5">{errors.aadhaarNumber.message}</p>}
          </Field>
        </div>

        {/* Improved Document Upload Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <ImageField
            label="Upload PAN Card"
            docName="panCard"
            onUploadSuccess={(data) => {
              const docs = watch("verificationDocs") || [];
              const updatedDocs = docs.some((d: any) => d.docName === data.name)
                ? docs.map((d: any) => d.docName === data.name ? { ...d, docUrl: data.url } : d)
                : [...docs, { docName: data.name, docUrl: data.url }];
              setValue("verificationDocs", updatedDocs, { shouldValidate: true });
            }}
            onRemove={() => {
              const docs = watch("verificationDocs") || [];
              setValue("verificationDocs", docs.filter((d: any) => d.docName !== "panCard"), { shouldValidate: true });
            }}
          />
          <ImageField
            label="Aadhaar Front Side"
            docName="aadhaarFront"
            onUploadSuccess={(data) => {
              const docs = watch("verificationDocs") || [];
              const updatedDocs = docs.some((d: any) => d.docName === data.name)
                ? docs.map((d: any) => d.docName === data.name ? { ...d, docUrl: data.url } : d)
                : [...docs, { docName: data.name, docUrl: data.url }];
              setValue("verificationDocs", updatedDocs, { shouldValidate: true });
            }}
            onRemove={() => {
              const docs = watch("verificationDocs") || [];
              setValue("verificationDocs", docs.filter((d: any) => d.docName !== "aadhaarFront"), { shouldValidate: true });
            }}
          />
        </div>
      </div>
    </FieldGroup>
  );
};