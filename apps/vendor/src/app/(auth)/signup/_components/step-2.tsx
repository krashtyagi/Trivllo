// "use client";

// import { useState, useRef } from "react";
// import { useFormContext, UseFormReturn } from "react-hook-form";
// import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
// import LOGO from "@/components/logo/logo";
// import { SignUpProps } from "@/schema/auth";
// import { cn } from "@/lib/utils";
// import { SelectContent, Select, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
// import ImageField from "./image-input";
// import { useAuthStore } from "@/stores/auth.store";


// interface UploadedFile {
//   url: string;
//   public_id: string;
//   resource_type: string;
// }


// export const Step_2 = ({
//   currentStep,
//   methods,
// }: {
//   currentStep: number;
//   methods: UseFormReturn<SignUpProps>;
// }) => {
//   const {
//     register,
//     formState: { errors },
//     watch,
//   } = methods;
//   return (
//     <FieldGroup className="space-y-6">


//       <div className="flex flex-col  gap-6">


//         {/* Business Name */}
//         <Field className="md:col-span-2">
//           <FieldLabel htmlFor="accountHolderName">AccountHolder Name</FieldLabel>
//           <Input
//             id="accountHolderName"
//             type="text"
//             placeholder="accountHolderName"
//             {...register("accountHolderName")}
//             className={cn(errors.accountHolderName && "border-destructive")}
//           />
//           {errors.accountHolderName && (
//             <p className="text-sm text-destructive mt-1">
//               {errors.accountHolderName.message}
//             </p>
//           )}
//         </Field>
//         {/* bank Name */}
//         <Field className="md:col-span-2">
//           <FieldLabel htmlFor="bankName">bankName Name</FieldLabel>
//           <Input
//             id="bankName"
//             type="text"
//             placeholder="accountHolderName"
//             {...register("bankName")}
//             className={cn(errors.bankName && "border-destructive")}
//           />
//           {errors.bankName && (
//             <p className="text-sm text-destructive mt-1">
//               {errors.bankName.message}
//             </p>
//           )}
//         </Field>



//         {/* account Number */}
//         <Field>
//           <FieldLabel htmlFor="accountNumber">Account Number</FieldLabel>
//           <Input
//             id="accountNumber"
//             type="number"
//             placeholder="1234567890"
//             {...register("accountNumber")}
//             className={cn(errors.accountNumber && "border-destructive")}
//           />
//           {errors.accountNumber && (
//             <p className="text-sm text-destructive mt-1">
//               {errors.accountNumber.message}
//             </p>
//           )}
//         </Field>

//         {/* ifsc code */}
//         <Field className="md:col-span-2">
//           <FieldLabel htmlFor="ifscCode">IFSC Code</FieldLabel>
//           <Input
//             id="ifscCode"
//             placeholder="IFSC123456"
//             {...register("ifscCode")}
//             className={cn(errors.ifscCode && "border-destructive")}
//           />
//           {errors.ifscCode && (
//             <p className="text-sm text-destructive mt-1">
//               {errors.ifscCode.message}
//             </p>
//           )}
//         </Field>
//         {/* branch name */}
//         <Field>
//           <FieldLabel htmlFor="branchName">Branch Name</FieldLabel>
//           <Input
//             id="branchName"
//             placeholder=""
//             {...register("branchName")}
//             className={cn(errors.branchName && "border-destructive")}
//           />
//           {errors.branchName && (
//             <p className="text-sm text-destructive mt-1">
//               {errors.branchName.message}
//             </p>
//           )}
//         </Field>
//         {/* upiid */}
//         <Field>
//           <FieldLabel htmlFor="upiId">UPI ID</FieldLabel>
//           <Input
//             id="upiId"
//             placeholder="upi@bank"
//             {...register("upiId")}
//             className={cn(errors.upiId && "border-destructive")}
//           />
//           {errors.upiId && (
//             <p className="text-sm text-destructive mt-1">
//               {errors.upiId.message}
//             </p>
//           )}
//         </Field>
//         <ImageField
//           label="Bank Proof"
//           docName="bankProof"
//           onUploadSuccess={(data) => {
//              methods.setValue("bankProof", {
//                url: data.url,
//                public_id: data.public_id,
//                resource_type: data.resource_type
//              }, { shouldValidate: true });
//           }}
//         />

//       </div>
//     </FieldGroup>
//   )
// }
"use client";

import { useFormContext, UseFormReturn } from "react-hook-form";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SignUpProps } from "@/schema/auth";
import ImageField from "./image-input";
import { Landmark, User, CreditCard, MapPin } from "lucide-react";

export const Step_2 = ({
  methods,
}: {
  currentStep: number;
  methods: UseFormReturn<SignUpProps>;
}) => {
  const { register, formState: { errors }, setValue } = methods;

  const inputClasses = "h-12 bg-white/[0.03] border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/40";

  return (
    <FieldGroup className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Section 1: Account Holder & Bank Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary/70" />
            <FieldLabel className="text-slate-200 font-medium">Account Holder Name</FieldLabel>
          </div>
          <Input
            id="accountHolderName"
            placeholder="Name as per Bank Records"
            {...register("accountHolderName")}
            className={cn(inputClasses, errors.accountHolderName && "border-destructive/50")}
          />
          {errors.accountHolderName && <p className="text-xs text-destructive mt-1.5">{errors.accountHolderName.message}</p>}
        </Field>

        <Field>
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="w-4 h-4 text-primary/70" />
            <FieldLabel className="text-slate-200 font-medium">Bank Name</FieldLabel>
          </div>
          <Input
            id="bankName"
            placeholder="e.g. HDFC Bank"
            {...register("bankName")}
            className={cn(inputClasses, errors.bankName && "border-destructive/50")}
          />
          {errors.bankName && <p className="text-xs text-destructive mt-1.5">{errors.bankName.message}</p>}
        </Field>
      </div>

      {/* Section 2: Numbers & Routing */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-primary/70" />
              <FieldLabel className="text-slate-200 font-medium">Account Number</FieldLabel>
            </div>
            <Input
              id="accountNumber"
              type="password" // Keep it masked initially for privacy
              placeholder="0000 0000 0000"
              {...register("accountNumber")}
              className={cn(inputClasses, "font-mono tracking-widest", errors.accountNumber && "border-destructive/50")}
            />
            {errors.accountNumber && <p className="text-xs text-destructive mt-1.5">{errors.accountNumber.message}</p>}
          </Field>

          <Field>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-primary/70 border border-primary/40 px-1 rounded">IFSC</span>
              <FieldLabel className="text-slate-200 font-medium">IFSC Code</FieldLabel>
            </div>
            <Input
              id="ifscCode"
              placeholder="HDFC0001234"
              {...register("ifscCode")}
              className={cn(inputClasses, "uppercase", errors.ifscCode && "border-destructive/50")}
            />
            {errors.ifscCode && <p className="text-xs text-destructive mt-1.5">{errors.ifscCode.message}</p>}
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <FieldLabel className="text-slate-200 font-medium">Branch Name</FieldLabel>
            </div>
            <Input
              id="branchName"
              placeholder="e.g. Downtown Branch"
              {...register("branchName")}
              className={cn(inputClasses)}
            />
          </Field>

          <Field>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-primary/70 border border-primary/40 px-1 rounded">UPI</span>
              <FieldLabel className="text-slate-200 font-medium">UPI ID (Optional)</FieldLabel>
            </div>
            <Input
              id="upiId"
              placeholder="username@bank"
              {...register("upiId")}
              className={cn(inputClasses)}
            />
          </Field>
        </div>
      </div>

      {/* Section 3: Bank Proof Upload */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-widest">Bank Verification</h3>
          <p className="text-xs text-muted-foreground">Upload a cancelled cheque or passbook front page.</p>
        </div>

        <div className="max-w-md">
          <ImageField
            label="Bank Proof"
            docName="bankProof"
            onUploadSuccess={(data) => {
              setValue("bankProof", {
                url: data.url,
                public_id: data.public_id,
                resource_type: data.resource_type
              }, { shouldValidate: true });
            }}
            onRemove={() => {
              setValue("bankProof", {
                url: "",
                public_id: "",
                resource_type: "image"
              }, { shouldValidate: true });
            }}
          />
        </div>
      </div>
    </FieldGroup>
  );
};