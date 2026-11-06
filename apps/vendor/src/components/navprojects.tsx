"use client"

import {
    ChevronRight,
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { IconCamera, IconDatabase } from "@tabler/icons-react"
const item=
    {
      title: "Financials",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Invoice",
          url: "#",
        },
        {
          title: "Expense",
          url: "#",
        },
      ],
    }
export function NavProjects() {
  const { isMobile } = useSidebar()

  return (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm py-0"
              >
                <CollapsibleTrigger className="p-0 m-0 justify-between">
                <IconDatabase/>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((it) => (
                      <SidebarMenuItem key={it.title}>
                        <SidebarMenuButton asChild >
                          <a href={it.url}>{it.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        
  )
}
