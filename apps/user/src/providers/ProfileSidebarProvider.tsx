"use client";

import React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHeadphones,
  IconListDetails,
  IconSettings,
  IconUsers,
  TablerIcon, // Import the correct type
} from "@tabler/icons-react";
import { useQueryState } from "nuqs";
import { Tabs, TabsTrigger } from "@/components/ui/tabscn";
import TripsAccordion from "@/app/(personal)/profile/_components/trips_acordion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

// --- Types ---

type NavLink = {
  name: string;
  value: string;
  icon?: TablerIcon; // Use TablerIcon type
  content: React.ReactNode;
  tabs?: {
    name: string;
    value: string;
  }[];
};

interface SidebarContextValue {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: NavLink[];
}

// --- Hook for translated sidebar data ---

function useTranslatedSidebarData(): SidebarContextValue {
  const { t } = useTranslation();

  const bookings = [
    { name: t("bookings.all"), value: "all" },
    { name: t("bookings.active"), value: "active" },
    { name: t("bookings.completed"), value: "completed" },
    { name: t("bookings.cancelled"), value: "cancelled" },
  ];

  return {
    user: {
      name: "user",
      email: "user@gmail.com",
      avatar: "/icons/user.png",
    },
    navMain: [
      {
        name: t("sidebar.personalData"),
        value: "personal_data",
        icon: IconDashboard,
        content: <p>{t("sidebar.personalData")}</p>,
      },
      // {
      //   name: t("sidebar.paymentAccount"),
      //   value: "payment",
      //   icon: IconListDetails,
      //   content: <p>{t("sidebar.paymentAccount")}</p>,
      // },
      {
        name: t("sidebar.bookings"),
        value: "bookings",
        icon: IconChartBar,
        tabs: bookings,
        content: (
          <TripsAccordion
            content={bookings.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="bg-background h-full w-full justify-start rounded-none border-0 border-l-2 border-zinc-300 dark:border-zinc-700 text-muted-foreground data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <p className="text-sm">{item.name}</p>
              </TabsTrigger>
            ))}
          />
        ),
      },
      {
        name: t("sidebar.wishLists"),
        value: "wishlist",
        icon: IconFolder,
        content: <p>{t("sidebar.wishLists")}</p>,
      },
      {
        name: t("sidebar.support"),
        value: "support",
        icon: IconHeadphones,
        content: <p>{t("sidebar.support")}</p>,
      },
      {
        name: t("sidebar.myReviews"),
        value: "reviews",
        icon: IconUsers,
        content: <p>{t("sidebar.myReviews")}</p>,
      },
      {
        name: t("sidebar.settings"),
        value: "settings",
        icon: IconSettings,
        content: <p>{t("sidebar.settings")}</p>,
      },
    ],
  };
}

// Keep the static bookings export for backward compatibility
export const bookings = [
  { name: "All", value: "all" },
  { name: "Active", value: "active" },
  { name: "Completed", value: "completed" },
  { name: "Cancelled", value: "cancelled" },
];

// --- Context & Provider ---

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export const ProfileSidebarProvider = ({
  className,
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const sidebarData = useTranslatedSidebarData();

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "personal_data",
    shallow: true,
  });

  return (
    <SidebarContext.Provider value={sidebarData}>
      <div className={cn("w-full", className)}>
        <Tabs
          value={tab ?? "personal_data"}
          onValueChange={(val) => setTab(val)}
          className="flex w-full flex-col md:flex-row items-start justify-between gap-4 px-2 md:px-0"
          orientation="vertical"
        >
          {children}
        </Tabs>
      </div>
    </SidebarContext.Provider>
  );
};

export const useProfileSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useProfileSidebar must be used within ProfileSidebarProvider");
  }
  return context;
};