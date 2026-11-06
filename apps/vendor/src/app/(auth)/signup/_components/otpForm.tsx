"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useFormContext, type UseFormReturn } from "react-hook-form";
import type { SignUpProps } from "@/schema/auth";
import { useEffect } from "react";
import { useAuthContext } from "@/context/auth/AuthContextProvider";
import ButtonHandler from "./buttonHandler";

type OTPFormProps = React.ComponentProps<typeof Card> & {
  onOTP: string;
  methods: UseFormReturn<SignUpProps>;
  setOnOTP: React.Dispatch<React.SetStateAction<string>>;
};

const OTP_LENGTH = 4;

export function OTPForm({ onOTP, methods, setOnOTP, ...props }: OTPFormProps) {
  const { setValue } = methods
  const { currentStep, setCurrentStep } = useAuthContext();

  // ✅ update form value safely
  useEffect(() => {
    setValue("otp", onOTP);
  }, [onOTP, setValue]);

  return (
    <Card {...props} className="w-full max-w-md mx-auto rounded-2xl shadow-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-xl font-semibold">
          Enter verification code
        </CardTitle>
        <CardDescription>
          We sent a {OTP_LENGTH}-digit code to your email.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup className="space-y-6">
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>

            <InputOTP
              id="otp"
              maxLength={OTP_LENGTH}
              value={onOTP}
              onChange={setOnOTP}
              className="justify-center"
            >
              <InputOTPGroup className="gap-3 w-full justify-center">
                {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index} // ✅ must be 0-based
                    className="
                      h-12 w-12
                      rounded-lg
                      border
                      text-lg
                      font-medium
                      bg-muted
                      focus-visible:ring-2
                      focus-visible:ring-ring
                    "
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <FieldDescription className="text-center">
              Enter the {OTP_LENGTH}-digit code sent to your email.
            </FieldDescription>
          </Field>

          {/* <ButtonHandler
            methods={methods}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          /> */}

          <FieldDescription className="text-center text-sm">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={async () => {
                const { toast } = await import("sonner");
                const { useAuthStore } = await import("@/stores/auth.store");
                const email = methods.getValues("email");
                const result = await useAuthStore.getState().resendOTP(email);
                if (result.success) {
                  toast.success(result.message || "OTP resent successfully");
                } else {
                  toast.error(result.message || "Failed to resend OTP");
                }
              }}
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Resend
            </button>
          </FieldDescription>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
