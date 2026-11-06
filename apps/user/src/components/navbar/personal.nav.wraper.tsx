"use client";
import React, { Suspense } from "react";
import { Footer } from "../footer/FFooter";
import { cn } from "@/lib/utils";
// import { MenuBar } from "../menubar";
import { Headset } from "lucide-react";
import dynamic from "next/dynamic";
import LOGO from "./logo";
const MenuBar = dynamic(() => import("../menubar").then(mod => ({ default: mod.MenuBar })), {
  ssr: false,
});
type Props = {};

const PersonalNavWroper = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()
  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col w-full">
      <div
        className={cn(
          "fixed top-0 left-0 z-50 w-full bg-card   flex flex-col justify-center h-15 md:h-20 bg-gradient-to-br from-zinc-200 to-transparent backdrop-blur-md dark:bg-gradient-to-br dark:from-zinc-700 dark:to-transparent backdrop-blur-lg border-b border-gray-300 dark:border-gray-700",
        )}
      >
        <div className="flex items-center justify-between py-3 md:px-9 px-2">
          <LOGO />

          <div className="hidden md:flex flex-col items-center gap-[5px] h-full justify-evenly">
          </div>

          {/* <div className="flex gap-9 p-1 justify-center items-center">
            <div>
              <DialogDemo trigger={<Headset color="blue" size={25} />} />

            </div>
            <Suspense>

              <MenuBar />
            </Suspense>
          </div> */}
          <TopRight isMobile={isMobile} />
        </div>
      </div>

      <main className={cn("flex-1 mt-17 md:mt-22")}>{children}</main>
      <div className="w-full border-1 mt-10" />

      <Footer />
      {<MobileNavWrapper content={<div className="flex h-14 items-center justify-around">
        <BottomNav />
      </div>} isMobile={isMobile} />}
    </div>
  );
};

export default PersonalNavWroper;
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile";
import TopRight from "./topRight";
import { BottomNav, MobileNavWrapper } from "./mobilenav";
// import RaiseTicketForm from "./TicketRaise";

export function DialogDemo({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      {/* sm:max-w-[425px] ensures it doesn't get too wide, p-4 is tighter */}
      <DialogContent className="sm:max-w-[500px] p-4 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Raise Ticket</DialogTitle>
        </DialogHeader>
        {/* <RaiseTicketForm /> */}
      </DialogContent>
    </Dialog>
  );
}
