"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useCurrentUser } from "@/services/queryes";
import { useQueryClient } from "@tanstack/react-query";
import { LoginFormProps, LoginScshema } from "@/schema/user";

export const useLogin = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const { userLogin } = useAuthStore();
  const { refetch } = useCurrentUser();
  const queryClient = useQueryClient();

  const methods = useForm<LoginFormProps>({
    resolver: zodResolver(LoginScshema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onHandleSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);

    try {
      const result = await userLogin(data);
      if (result.success) {
        toast.success(result.message || "Login successful!");

        // Update React Query cache immediately so layout guards don't see null/stale user
        queryClient.setQueryData(["current_user"], { data: result.user });
        await queryClient.invalidateQueries({ queryKey: ["current_user"] });
        await refetch();

        const role = result.user?.role;
        const targetUrl =
          role === "blog_author" ||
          role === "blog_editor" ||
          role === "seo_manager"
            ? "/blog"
            : "/dashboard";

        // Full navigation to ensure complete session hydration and zero race conditions
        window.location.href = targetUrl;
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
