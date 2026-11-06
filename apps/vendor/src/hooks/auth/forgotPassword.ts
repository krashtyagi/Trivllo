import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResetPasswordProps,
  ResetPasswordSchema,
} from "@/schema/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

export const useResetPassword = (onSuccess?: () => void) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useRouter();
  const { forgotPassword, verifyForgotPasswordOTP, resetPassword } =
    useAuthStore();

  const methods = useForm<ResetPasswordProps>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onHandleSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const result = await resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.password,
      });
      if (result.success) {
        toast.success(result.message || "Password reset successfully");
        onSuccess?.();
        navigate.push("/login");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  });

  const onVerify = async (
    email: string,
    otp: string,
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);

    try {
      const result = await verifyForgotPasswordOTP({
        email: email,
        otp: otp,
        endpoint: "/auth/otp-verify",
      });
      if (result.success) {
        onNext((prev) => prev + 1);
        toast.success(result.message || "OTP verified successfully");
      } else {
        toast.error(result.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onGenerateOtp = async (
    email: string,
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);
    try {
      const result = await forgotPassword({
        email,
      });
      if (result.success) {
        toast.success(result.message || "OTP sent to your email");
        onNext((prev) => prev + 1);
      } else {
        toast.error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    methods,
    onHandleSubmit,
    onVerify,
    onGenerateOtp,
  };
};
