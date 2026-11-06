'use client'

import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MessageModal } from "@/app/(dashboard)/(categories)/rooms/_components/RoomsListing";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { PageSkeleton } from "@/app/(dashboard)/(categories)/rooms/_components/details.skeleton";
import {
  useAuthContext,
} from "@/context/auth/AuthContextProvider";
import LOGO from "@/components/logo/logo";
import { OTPForm } from "./_components/otpForm";
import { useSignUp } from "./hooks/use-signup";
import React from "react";
import trivlloData from "@/../trivllo.json";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { SignUpProps } from "@/schema/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ButtonHandler from "./_components/buttonHandler";
import { Step1Skeleton, OtpSkeleton } from "./_components/skeletons";
export default function SignupPage() {
  const { currentStep } = useAuthContext();

  return (
    <ErrorBoundary
      fallback={
        <MessageModal title="Error" description="Something went wrong" />
      }
    >
      <Suspense fallback={<PageSkeleton />}>
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 ">
          <div className=" max-w-md w-full ">
            <SignupForm />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const { currentStep, setCurrentStep } = useAuthContext();
  const { loading, methods, onHandleSubmit, onGenerateOtp, veryOtp } = useSignUp();
  if (loading) {
    if (currentStep === 2) {
      return <Step1Skeleton />;
    }
    return <OtpSkeleton />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...methods}>
        <form onSubmit={onHandleSubmit}>
          <SignupOtp currentStep={currentStep} methods={methods} />
          <div className="flex justify-center p-4">
            <ButtonHandler
              currentStep={currentStep}
              methods={methods}
              setCurrentStep={setCurrentStep}
              loading={loading}
              onGenerateOtp={onGenerateOtp}
              veryOtp={veryOtp}
            />
          </div>
        </form>
      </Form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

const SignupOtp = ({
  currentStep,
  methods,
}: {
  currentStep: number;
  methods: UseFormReturn<SignUpProps>;
}) => {
  const [onOTP, setOnOTP] = React.useState<string>("");
  const {
    register,
    formState: { errors },
    watch,
  } = methods;
  if (currentStep === 2) {
    return <OTPForm methods={methods} onOTP={onOTP} setOnOTP={setOnOTP} />;
  }
  return (
    <FieldGroup className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex items-center justify-center rounded-md">
            <LOGO />
          </div>
          <span className="sr-only">{trivlloData.company_name} Vendor</span>
          <h1 className="text-2xl font-bold">Welcome to {trivlloData.company_name} Vendor</h1>
        </a>
        <FieldDescription>
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </FieldDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email */}
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="example@example.com"
            {...register("email")}
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className={cn(errors.password && "border-destructive")}
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            className={cn(errors.confirmPassword && "border-destructive")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </Field>

        {/* Role */}
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select
            disabled={true}
            onValueChange={(value) => methods.setValue("role", value as any)}
            defaultValue="vendor"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive mt-1">
              {errors.role.message}
            </p>
          )}
        </Field>

        {/* First Name */}
        <Field>
          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
          <Input
            id="firstName"
            placeholder="Rahul"
            {...register("firstName")}
            className={cn(errors.firstName && "border-destructive")}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">
              {errors.firstName.message}
            </p>
          )}
        </Field>

        {/* Last Name */}
        <Field>
          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
          <Input
            id="lastName"
            placeholder="Sharma"
            {...register("lastName")}
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">
              {errors.lastName.message}
            </p>
          )}
        </Field>

        {/* Phone Number */}
        <Field>
          <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="9876543210"
            {...register("phoneNumber")}
            className={cn(errors.phoneNumber && "border-destructive")}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </Field>

        {/* Gender */}
        {/* <Field>
          <FieldLabel>Gender</FieldLabel>
          <Select
            onValueChange={(value) => methods.setValue("gender", value as any)}
            defaultValue="male"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive mt-1">
              {errors.gender.message}
            </p>
          )}
        </Field> */}

        {/* Date of Birth */}
        {/* <Field>
          <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
          <Input
            id="dob"
            type="date"
            {...register("dob")}
            className={cn(errors.dob && "border-destructive")}
          />
          {errors.dob && (
            <p className="text-sm text-destructive mt-1">
              {errors.dob.message}
            </p>
          )}
        </Field> */}

        {/* Country */}
        {/* <Field>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input
            id="country"
            placeholder="India"
            {...register("country")}
            className={cn(errors.country && "border-destructive")}
          />
          {errors.country && (
            <p className="text-sm text-destructive mt-1">
              {errors.country.message}
            </p>
          )}
        </Field> */}

        {/* Address - Full Width */}
        {/* <Field className="md:col-span-2">
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input
            id="address"
            placeholder="MG Road, Bangalore"
            {...register("address")}
            className={cn(errors.address && "border-destructive")}
          />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">
              {errors.address.message}
            </p>
          )}
        </Field> */}

        {/* Zipcode */}
        {/* <Field className="md:col-span-2">
          <FieldLabel htmlFor="zipcode">Zipcode / Postal Code</FieldLabel>
          <Input
            id="zipcode"
            placeholder="452001"
            {...register("zipcode")}
            className={cn(errors.zipcode && "border-destructive")}
          />
          {errors.zipcode && (
            <p className="text-sm text-destructive mt-1">
              {errors.zipcode.message}
            </p>
          )}
        </Field> */}
      </div>
    </FieldGroup>
  );
};
