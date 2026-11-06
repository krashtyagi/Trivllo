"use client"
import { Button } from "@/components/ui/button"

import {
  Sheet,
  SheetContent,

  SheetTitle,

  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

// import { useMobileValue } from "@/context/mobile-value"
import { IconMenu } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
type Direction = "left" | "right" | "top" | "bottom"
export function MobileNav({direction , tabsChildren}: {direction:Direction , tabsChildren:React.ReactNode}) {
  const [open , setOpen ] = useState<boolean>(false)
  const location = usePathname()
const ismobile = useIsMobile()

useEffect(() => {
  setOpen(false)
}, [location])
  return (
    <Sheet open={open && ismobile} onOpenChange={setOpen}>
      <SheetTrigger asChild >
        <Button variant="ghost" className="md:hidden">
          <IconMenu />
        </Button>
      </SheetTrigger>
      <SheetContent side={direction} className="overflow-y-auto scrollbar-hide" >
        <SheetTitle className="flex items-center justify-center w-full" >logo</SheetTitle>
        
        <div className="flex flex-col gap-6  bg-transparent ">
          {tabsChildren}
        </div>
       
      </SheetContent>
    </Sheet>
  )
}
