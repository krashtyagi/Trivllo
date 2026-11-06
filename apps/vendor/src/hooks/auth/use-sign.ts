"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginScshema, type LoginFormProps } from "@/schema/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useCurrentUser } from "@/services/queryes";
import { useAuthContext } from "@/context/auth/AuthContextProvider";
import { useProcessContext } from "@/context/auth/ProcessContextProvider";

export const useLogin = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useRouter();
  const { userLogin, setCurrStep, setSteeperStep , draft} = useAuthStore();
  const { refetch } = useCurrentUser();
  const { setCurrentStep } = useProcessContext();
  // const {nextRoute , setNextRoute} = useRoutingStore()
  const methods = useForm<LoginFormProps>({
    resolver: zodResolver(LoginScshema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });
  const router = useRouter();
  const onHandleSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);

    try {
      const result = await userLogin(data);
      if (result.success) {
        toast.success(result.message || "Login successful!");

        if (result.status === "draft") {
          setCurrStep(result.currentStep! + 1);
          setCurrentStep(result.currentStep! + 1);
          window.location.href = "/signup/process";
        } else if (result.status === "pending") {
          setCurrStep(6);
          setCurrentStep(result.currentStep! + 2);
          window.location.href = "/signup/process";
        } else if (result.status === "rejected") {
          toast.error("Your account has been rejected");
          setSteeperStep(result.currentStep! + 1);
          setCurrStep(result.currentStep!);
          window.location.href = "/signup/process";
        } else if (result.status === "approved") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    methods,
    onHandleSubmit,
  };
};
