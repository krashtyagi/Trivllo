"use client"

import { useRouter, usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useEffect, useState } from "react"

interface NavSubItem {
  title: string
  url: string
}

interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string; size?: number }>
  items?: NavSubItem[]
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent mismatched IDs by not rendering the dynamic 
  // collapsible elements until the client is ready
  if (!isMounted) {
    return null // or a simplified loading skeleton
  }

  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => {
        const isParentActive = pathname === item.url
        const hasChildren = !!item.items?.length
        const isAnyChildActive = hasChildren && item.items!.some((sub) => pathname === sub.url)
        const isActive = isParentActive || isAnyChildActive

        if (hasChildren) {
          return (
            <Collapsible
              key={item.title}
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className={`
                      justify-between transition-colors
                      data-[active=true]:bg-primary data-[active=true]:text-sidebar-accent-foreground
                      hover:bg-primary/70 hover:text-sidebar-accent-foreground
                      [&>svg]:text-muted-foreground group-data-[state=open]/collapsible:[&>svg:last-child]:text-foreground
                    `}
                    onClick={(e) => {
                      // Allow navigation to parent overview page
                      if ((e.target as HTMLElement).tagName !== "SVG" && item.url !== "#") {
                        router.push(item.url)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && (
                        <item.icon size={18} className="shrink-0" />
                      )}
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>

                    <ChevronRight
                      className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground group-hover:text-foreground"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="transition-all duration-200">
                  <SidebarMenuSub className="ml-0 pl-7 border-l border-sidebar-border/50">
                    {item.items!.map((sub) => {
                      const subActive = pathname.split("/")[1] === sub.url.split("/")[0]
                      return (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subActive}
                            onClick={() => router.push(sub.url)}
                            className={`
                              text-sm py-1.5
                              data-[active=true]:text-sidebar-primary data-[active=true]:font-medium
                              hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground
                            `}
                          >
                            <span>{sub.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        }

        // Flat items
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname === item.url}
              onClick={() => router.push(item.url)}
              className={`
                gap-3 py-2.5
                data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium
                hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground
                transition-colors
              `}
            >
              {item.icon && <item.icon size={18} className="shrink-0" />}
              <span className="text-sm font-medium">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}