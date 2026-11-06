'use client'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
// import { data } from "./app-sidebar"
import { NavUser } from "./nav-user"
import { IconNotification, IconSettings } from "@tabler/icons-react"
import { ModeToggle } from "./ui/toggle-theme"
import { Spinner } from "./ui/spinner"
import { Suspense } from "react"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-getDashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-properties"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-roomTypes"] }),
        queryClient.invalidateQueries({ queryKey: ["vendor-getRooms"] }),
        queryClient.invalidateQueries({ queryKey: ["user-getCalender"] }),
      ])
      toast.success("Data refreshed successfully!")
    } catch (e) {
      toast.error("Failed to refresh data")
    } finally {
      setTimeout(() => setIsRefreshing(false), 400)
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pathname.split("/")[1]?.toUpperCase() || "DASHBOARD"}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-muted"
            title="Refresh dashboard & stats"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground transition-transform", isRefreshing && "animate-spin text-primary")} />
          </Button>
          <NavUser />
          <ModeToggle/>
        </div>
      </div>
    </header>
  )
}
