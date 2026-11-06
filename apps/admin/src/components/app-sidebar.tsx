"use client";

import * as React from "react";

import { NavMain, NavItem, NavSection } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  Home,
  CalendarHeartIcon,
  Tag,
  Star,
  IndianRupee,
  Building2,
  BookOpen,
  Layers,
  ShieldCheck,
} from "lucide-react";
import LOGO from "./logo/logo";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/services/queryes";

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Users",
    url: "/users",
    icon: <UsersIcon />,
  },
  {
    title: "Device Sessions",
    url: "/sessions",
    icon: <ShieldCheck />,
  },
  {
    title: "Properties",
    url: "/properties",
    icon: <Home />,
  },
  {
    title: "New Properties",
    url: "/new-properties",
    icon: <Building2 />,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: <CalendarHeartIcon />,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: <IndianRupee />,
  },
  {
    title: "Promotions",
    url: "/promotions",
    icon: <Tag />,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: <Star />,
  },
  {
    title: "Support",
    url: "/support",
    icon: <CircleHelpIcon />,
  },
  {
    title: "Requests",
    url: "/Requests",
    icon: <ListIcon />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings2Icon />,
  },
];

const marketNavItems: NavItem[] = [
  {
    title: "Blog CMS",
    url: "/blog",
    icon: <BookOpen />,
  },
  {
    title: "Blog Categories",
    url: "/blog-categories",
    icon: <Layers />,
  },
  {
    title: "Writers (RBAC)",
    url: "/writers",
    icon: <ShieldCheck />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: userRes } = useCurrentUser();

  const role = userRes?.data?.role;
  // Only admin and super_admin can see the Admin section
  const isAdmin = role === "admin" || role === "super_admin";

  // Close sidebar on mobile navigation
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  const marketItems = isAdmin
    ? marketNavItems
    : marketNavItems.filter((item) => item.url !== "/writers");

  const sections: NavSection[] = isAdmin
    ? [
        {
          title: "Admin",
          items: adminNavItems,
        },
        {
          title: "Market",
          items: marketItems,
        },
      ]
    : [
        {
          title: "Market",
          items: marketItems,
        },
      ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <LOGO className="w-20" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <NavMain sections={sections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
