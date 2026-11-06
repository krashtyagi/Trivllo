"use client";

import { RouterPush } from "@/components/RouterPush";
import { useRouter } from "next/navigation";

export const useNextGoingRoute = () => {
  const router = useRouter();

  const goWithAuth = (nextRoute: string, isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      localStorage.setItem("nextRoute", nextRoute);

      RouterPush(router, "/login");
      return;
    }

    RouterPush(router, nextRoute);
  };

  return { goWithAuth };
};
