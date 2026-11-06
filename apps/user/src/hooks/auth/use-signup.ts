import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpProps, SignUpSchema } from "@/schema/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useCurrentUser } from "@/services/hotel/querys";
import { dotoggleLike } from "@/services/hotel/hotel.service";
import { RouterPush } from "@/components/RouterPush";

export const useSignUp = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useRouter();
  const { userSignup, verifyOTP } = useAuthStore();

  const methods = useForm<SignUpProps>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
    },
    mode: "onChange",
  });
  const { refetch } = useCurrentUser();
  const onHandleSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);

    try {
      const result = await verifyOTP({
        email: data.email,
        otp: data.otp,
        endpoint: "/auth/email-verify-otp",
      });
      if (result.success) {
        toast.success(result.message || "Account created successfully!");
        await refetch();
        const nextRoute = localStorage.getItem("nextRoute");
        const like = localStorage.getItem("like");
        if (nextRoute) {
          RouterPush(navigate, nextRoute);
          localStorage.removeItem("nextRoute");
        } else if (like) {
          const result = await dotoggleLike(like, "hotel");
          localStorage.removeItem("like");
          window.location.reload();
        } else {
          refetch();
          navigate.push("/");
        }
        // Redirect or close dialog
      } else {
        toast.error(result.message || "Failed to verify OTP");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  });

  const onGenerateOtp = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    setLoading(true);
    try {
      const result = await userSignup({ email, password });
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
    onGenerateOtp,
  };
};
