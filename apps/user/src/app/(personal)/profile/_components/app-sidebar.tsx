"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfileSidebar } from "../../../../providers/ProfileSidebarProvider";
import { cn } from "@/lib/utils";
import { IconSettings } from "@tabler/icons-react";
import { TabsTrigger } from "@/components/ui/tabscn";
import { useCurrentUser } from "@/services/hotel/querys";
import { useTranslation } from "@/hooks/useTranslation";
import { useQueryState } from "nuqs";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { AlertOverlay } from "@/components/ui/alert-dialouge";
import { userAccessToken } from "@/types/auth";
import { signOut } from "@/lib/auth-client";

export function ProfileSidebar({ className }: { className?: string }) {
  const { navMain, user } = useProfileSidebar();
  const { data: currUser } = useCurrentUser();
  const { t } = useTranslation();

  const [tab] = useQueryState("tab", {
    defaultValue: "personal_data",
    shallow: true,
  });

  const isBookingTab = ["all", "active", "completed", "cancelled"].includes(tab || "");
  const bookingValue = isBookingTab ? (tab || "all") : "all";

  return (
    <aside
      className={cn(
        "md:w-[280px] w-full rounded-xl bg-background p-4 shadow-none md:shadow-sm flex flex-col md:block border border-border ",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-2 py-3 hidden md:block ">
        <Image
          src={currUser?.data?.avatar || user.avatar}
          alt={currUser?.data?.name || user.name}
          width={40}
          height={40}
          className="rounded-full object-cover h-10 w-10"
        />
        <div>
          <p className="text-sm font-medium">{currUser?.data?.firstName}</p>
          <p className="text-xs text-muted-foreground">{t("sidebar.customerOps")}</p>
        </div>
      </div>

      <div className="my-3 h-px bg-border hidden md:block" />

      {/* Mobile-only horizontal navigation (Accordion-free, using a flat bookings trigger) */}
      <nav className="flex md:hidden overflow-x-auto gap-2 -mx-4 px-5 pb-2 scrollbar-hide">
        {navMain.map((item) => {
          if (item.value === "settings") return null;
          const Icon = item.icon;
          if (item.value === "bookings") {
            return (
              <TabsTrigger
                className="py-2 px-4 rounded-full justify-start hover:bg-muted/50 transition-colors data-[state=active]:bg-muted data-[state=active]:font-medium whitespace-nowrap flex items-center border border-border"
                key={item.value}
                value={bookingValue}
              >
                {Icon && <Icon className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />}
                <span className="text-sm">{t("sidebar.bookings")}</span>
              </TabsTrigger>
            );
          }
          return (
            <TabsTrigger
              className="py-2 px-4 rounded-full justify-start hover:bg-muted/50 transition-colors data-[state=active]:bg-muted data-[state=active]:font-medium whitespace-nowrap flex items-center border border-border"
              key={item.name}
              value={item.value}
            >
              {Icon && <Icon className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />}
              <span className="text-sm">{item.content}</span>
            </TabsTrigger>
          );
        })}
        <TabsTrigger
          className="py-2 px-4 rounded-full justify-start hover:bg-muted/50 transition-colors data-[state=active]:bg-muted data-[state=active]:font-medium whitespace-nowrap flex items-center border border-border"
          value="settings"
        >
          <IconSettings className="h-5 w-5 mr-2 text-muted-foreground shrink-0" />
          <span className="text-sm">{t("sidebar.settings")}</span>
        </TabsTrigger>
      </nav>

      {/* Desktop-only vertical navigation (with accordion) */}
      <nav className="hidden md:flex flex-col gap-2">
        {navMain.map((item) => {
          if (item.value === "settings") return null;
          const Icon = item.icon;
          if (item.value === "bookings") {
            return (
              <div key={item.value} className="flex py-2 px-3 cursor-pointer items-center rounded-lg hover:bg-muted/50 transition-colors">
                {Icon && <Icon className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />}
                <span className="text-sm font-medium w-full">{item.content}</span>
              </div>
            );
          }
          return (
            <TabsTrigger
              className="py-2 px-3 rounded-lg justify-start hover:bg-muted/50 transition-colors data-[state=active]:bg-muted data-[state=active]:font-medium flex items-center"
              key={item.name}
              value={item.value}
            >
              {Icon && <Icon className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />}
              <span className="text-sm">{item.content}</span>
            </TabsTrigger>
          );
        })}
        <div className="my-2 h-px bg-border" />
        <TabsTrigger
          className="py-2 px-3 justify-start rounded-lg hover:bg-muted/50 transition-colors data-[state=active]:bg-muted data-[state=active]:font-medium flex items-center"
          value="settings"
        >
          <IconSettings className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
          <span className="text-sm">{t("sidebar.settings")}</span>
        </TabsTrigger>
      </nav>
    </aside>
  );
}

export const Logout = ({ refetch }: { refetch: () => void }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {}
    localStorage.removeItem(userAccessToken);
    localStorage.removeItem("nextRoute");
    localStorage.removeItem("trivllo_user_wishlist");

    queryClient.removeQueries({ queryKey: ["current_user"] });
    refetch();
    window.location.reload();
  };

  return (
    <AlertOverlay
      trigger={t("auth.logout")}
      variant="ghost"
      handelSumbit={handleLogout}
      title={t("auth.logout")}
      description={t("auth.logoutConfirm")}
      continueTitle={t("auth.logout")}
      canecelTitle={t("settings.cancel")}
    />
  );
};
