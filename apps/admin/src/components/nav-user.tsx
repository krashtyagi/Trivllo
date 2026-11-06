"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLayoutDashboard,
  IconLogin,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/services/queryes"
import { usePathname, useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"
import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query";
import { useVariants } from "@/providers/main-provider/variants-provider"
import { adminAccessToken } from "@/services/auth"
import { signOut } from "@/lib/auth-client"

export function NavUser() {
  const router = useRouter()
  const pathname = usePathname()

  const { isMobile } = useSidebar()
  const { data: vendor, isLoading, refetch, isRefetching } = useCurrentUser();
  const [mounted, setMounted] = useState(false)

  const queryClient = useQueryClient();
  const { setVariant, variant } = useVariants()


  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null


  if (isLoading || isRefetching) {
    return <Spinner />
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground left-0"
            >
              <Avatar className="h-8 w-8 rounded-full grayscale">
                <AvatarImage src={vendor?.data?.hotelDetails?.images[0]?.url || '/girl.png'} alt={vendor?.data?.hotelDetails?.name || 'vendor'} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{vendor?.data?.hotelDetails?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {vendor?.data?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={vendor?.data?.hotelDetails?.images[0]?.url || '/girl.png'} alt={vendor?.data?.hotelDetails?.name || 'vendor'} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{vendor?.data?.hotelDetails?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {vendor?.data?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => {
                if (pathname !== "/profile") {
                  router.push("/profile")
                }
              }}>
                <IconUserCircle />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setVariant(variant === "sidebar" ? "floating" : variant === "floating" ? "inset" : "sidebar")
              }}>
                <IconLayoutDashboard />
                Sidebar Theme
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => {
              try {
                await signOut();
              } catch (e) {}
              localStorage.removeItem(adminAccessToken)
              localStorage.removeItem("status")
              queryClient.clear();
              router.push("/login")

            }}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
