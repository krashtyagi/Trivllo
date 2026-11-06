import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import AddRoomForm from "../new/page"

export function EditRoom() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" >Edit</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll p-10 w-8/10" >
        <SheetHeader>
          <SheetTitle>Edit Room</SheetTitle>
          <SheetDescription>
            Make changes to your Room here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <AddRoomForm />
       
      </SheetContent>
    </Sheet>
  )
}
