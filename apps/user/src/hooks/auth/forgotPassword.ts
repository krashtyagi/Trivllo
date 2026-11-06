import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ResetPasswordProps,
  ResetPasswordSchema,
  type SignUpProps,
  SignUpSchema,
} from "@/schema/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useCurrentUser } from "@/services/hotel/querys";
import { dotoggleLike } from "@/services/hotel/hotel.service";
import { RouterPush } from "@/components/RouterPush";

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
  const { refetch } = useCurrentUser();

  const onHandleSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const result = await resetPassword({
        email: data.email,
        otp: data.otp,
        newPassword: data.password,
      });
      if (result.success) {
        toast.success(result.message || "password reset successfully");
        onSuccess?.();
        RouterPush(navigate, "/");
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
    // Skip separate OTP verification API call.
    // The OTP will be verified by /auth/reset-password when the user submits the new password.
    // This avoids /auth/email-verify-otp clearing the OTP before reset-password can use it.
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    onNext((prev) => prev + 1);
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
