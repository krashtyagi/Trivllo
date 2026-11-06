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
import { useAuthForm } from "@/context/auth/auth-form-provider";
import ButtonHandler from "./buttonhandler";

import { useFormContext, type UseFormReturn } from "react-hook-form";
import type { ResetPasswordProps, SignUpProps } from "@/schema/auth";
import { useEffect } from "react";
import { useResetPasswordForm } from "@/context/auth/resetpasswordsteps";
import ForgetPasswordHandeler from "./forgetpasswordhandelser";
import { cn } from "@/lib/utils";

type OTPFormProps = React.ComponentProps<typeof Card> & {
    onOTP: string;
    methods: UseFormReturn<ResetPasswordProps>;
    setOnOTP: React.Dispatch<React.SetStateAction<string>>;
    className?: string
};

const OTP_LENGTH = 4;

export function ForgotPasswordOTPForm({ onOTP, methods, setOnOTP, ...props }: OTPFormProps) {
    const { setValue } = useFormContext<ResetPasswordProps>();
    const { currentStep, setCurrentStep } = useResetPasswordForm();

    // ✅ update form value safely
    useEffect(() => {
        setValue("otp", onOTP);
    }, [onOTP, setValue]);

    return (
        <Card {...props} className={cn("w-full w-70 sm:w-80 md:w-90 lg:w-100 xl:w-110  shadow-none  rounded-2xl", "bg-transparent border-none")}>
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-xl font-semibold">
                    Enter verification code
                </CardTitle>
                <CardDescription>
                    We sent a {OTP_LENGTH}-digit code to your email.
                </CardDescription>
            </CardHeader>

            <CardContent className="w-full shadow-none">
                <FieldGroup className="space-y-6 w-full">
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

                    <ForgetPasswordHandeler
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                    />

                    <FieldDescription className="text-center text-sm">
                        Didn&apos;t receive the code?{" "}
                        <button
                            type="button"
                            onClick={async () => {
                                const { toast } = await import("sonner");
                                const { useAuthStore } = await import("@/store/auth.store");
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
