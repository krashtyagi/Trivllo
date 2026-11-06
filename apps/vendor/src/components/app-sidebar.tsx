"use client"

import * as React from "react"
import {
  IconBike,
  IconBuildingCommunity,
  IconCalendar,
  IconCar,
  IconDashboard,
  IconDatabase,
  IconDiscount2,
  IconFileInvoice,
  IconHome,
  IconListDetails,
  IconMapPin,
  IconMessage,
  IconMountain,
  IconPhone,
  IconSpeakerphone,
  IconTag,
  IconTower,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import LOGO from "./logo/logo"
import { PropertySwitcher } from "./property-switcher"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export const data = {
  user: {
    name: "Joylan dorwart",
    email: "admin@gmail.com",
    avatar: "/girl.png",
  },
  navMain: {
    hotel: [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Reservation", url: "/reservation", icon: IconListDetails },
      { title: "Rooms", url: "/rooms", icon: IconHome },
      { title: "Calendar", url: "/calendar", icon: IconCalendar },
      { title: "Reviews", url: "/reviews", icon: IconMessage },
      { title: "Invoice", url: "/invoice", icon: IconFileInvoice },
      { title: "Advertisements", url: "/advertisements", icon: IconSpeakerphone },
      { title: "Promotions", url: "/promotions", icon: IconDiscount2 },
      { title: "Listing", url: "/listing", icon: IconBuildingCommunity },
      { title: "Settings", url: "/settings", icon: IconSettings },
    ],
    adventure: [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Reservation", url: "/reservation", icon: IconListDetails },
      { title: "Adventure", url: "/adventures", icon: IconMountain },
      { title: "Reviews", url: "/reviews", icon: IconMessage },
      { title: "Invoice", url: "/invoice", icon: IconFileInvoice },
      { title: "Advertisements", url: "/advertisements", icon: IconSpeakerphone },
      { title: "Promotions", url: "/promotions", icon: IconDiscount2 },
      { title: "Listing", url: "/listing", icon: IconMapPin },
      { title: "Settings", url: "/settings", icon: IconSettings },
    ],
    cab: [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Reservation", url: "/reservation", icon: IconListDetails },
      { title: "Cabs", url: "/cabs", icon: IconCar },
      { title: "Reviews", url: "/reviews", icon: IconMessage },
      { title: "Invoice", url: "/invoice", icon: IconFileInvoice },
      { title: "Advertisements", url: "/advertisements", icon: IconSpeakerphone },
      { title: "Promotions", url: "/promotions", icon: IconDiscount2 },
      { title: "Listing", url: "/listing", icon: IconMapPin },
      { title: "Settings", url: "/settings", icon: IconSettings },
    ],
    bike: [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Reservation", url: "/reservation", icon: IconListDetails },
      { title: "Bikes", url: "/bikes", icon: IconBike },
      { title: "Reviews", url: "/reviews", icon: IconMessage },
      { title: "Invoice", url: "/invoice", icon: IconFileInvoice },
      { title: "Advertisements", url: "/advertisements", icon: IconSpeakerphone },
      { title: "Promotions", url: "/promotions", icon: IconDiscount2 },
      { title: "Listing", url: "/listing", icon: IconMapPin },
      { title: "Settings", url: "/settings", icon: IconSettings },
    ],
    tour: [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Reservation", url: "/reservation", icon: IconListDetails },
      { title: "Tours", url: "/tours", icon: IconTower },
      { title: "Reviews", url: "/reviews", icon: IconMessage },
      { title: "Invoice", url: "/invoice", icon: IconFileInvoice },
      { title: "Advertisements", url: "/advertisements", icon: IconSpeakerphone },
      { title: "Promotions", url: "/promotions", icon: IconDiscount2 },
      { title: "Listing", url: "/listing", icon: IconMapPin },
      { title: "Settings", url: "/settings", icon: IconSettings },
    ],
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const [currCategory, setCurrCategory] = React.useState<keyof typeof data.navMain>("hotel");

  React.useEffect(() => {
    const savedCategory = localStorage.getItem("category") as keyof typeof data.navMain;
    if (savedCategory && data.navMain[savedCategory]) {
      setCurrCategory(savedCategory);
    }

    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  const activeNavigationItems = data.navMain[currCategory] || data.navMain.hotel;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5 hover:bg-transparent">
              <React.Suspense fallback={<div><Loader2 className="animate-spin" /></div>}>
                <LOGO />
              </React.Suspense>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={activeNavigationItems} />
      </SidebarContent>

      <SidebarFooter className="gap-2 p-2">
        <PropertySwitcher />
        <div className="w-full border-t border-sidebar-border/60 my-0.5" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}