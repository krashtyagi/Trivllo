
import {
  Sheet,

  SheetContent,

  SheetTrigger,
} from "@/components/ui/sheet";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { HotelContextProvider } from "@/context/hotel/HotelContextProvider";
export const SheetNavigation = ({ trigger, content, setOpen }: { trigger: React.ReactNode; content: React.ReactNode; setOpen: (value: boolean) => void }) => {
  return (
    <Sheet onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-y-scroll bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-none shadow-2xl p-3 sm:p-5 rounded-l-3xl">
        <VisuallyHidden>
          <DialogTitle>Menu</DialogTitle>
          <DialogDescription>
            This dialog contains navigation options.
          </DialogDescription>
        </VisuallyHidden>
        <HotelContextProvider>
          {content}
        </HotelContextProvider>


      </SheetContent>
    </Sheet>
  );
}
