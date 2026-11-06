import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginScshema, type LoginFormProps } from "@/schema/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useCurrentUser } from "@/services/hotel/querys";
import { dotoggleLike } from "@/services/hotel/hotel.service";
import { RouterPush } from "@/components/RouterPush";

export const useLogin = ({ refetch }: { refetch: () => void }) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const navigate = useRouter();
  const { userLogin } = useAuthStore();

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
        // Redirect or close dialog
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
          navigate.push("/");
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
