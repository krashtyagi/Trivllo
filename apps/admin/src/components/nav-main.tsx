"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { RouterPush } from "./RouterPush"

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export function NavMain({
  sections,
  items,
}: {
  sections?: NavSection[]
  items?: NavItem[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const handelNavigation = (url: string) => {
    if (pathname === url) return
    RouterPush(router, url)
  }

  if (sections && sections.length > 0) {
    return (
      <div className="flex flex-col gap-3 py-1">
        {sections.map((section) => (
          <SidebarGroup key={section.title} className="p-0 px-2">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2.5 h-7">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-1 mt-0.5">
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem
                    onClick={() => handelNavigation(item.url)}
                    key={item.title}
                  >
                    <SidebarMenuButton
                      className={cn(
                        pathname === item.url &&
                          "bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground font-medium"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </div>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items?.map((item) => (
            <SidebarMenuItem
              onClick={() => handelNavigation(item.url)}
              key={item.title}
            >
              <SidebarMenuButton
                className={cn(
                  pathname === item.url &&
                    "bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
