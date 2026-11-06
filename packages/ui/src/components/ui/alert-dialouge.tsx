import { DeleteAccountRequestDialog } from "@/app/(personal)/profile/_components/settings/deleteProfileRequest"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import React from "react"
// <DeleteAccountRequestDialog tag={"Delete my profile"} variant="destructive" />

export function AlertOverlay({ trigger, title, description, canecelTitle, continueTitle, variant, handelSumbit }: {
  trigger: string,
  variant?: "default" | "destructive" | "link" | "outline" | "secondary" | "ghost"
  title: string,
  description: string,
  canecelTitle: string,
  continueTitle: string,
  handelSumbit: () => void,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} >{trigger}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col flex">
          <AlertDialogCancel>{canecelTitle}</AlertDialogCancel>
          <AlertDialogAction onClick={handelSumbit}>{continueTitle}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export function DeleteProfileRequestDialog({ trigger, title, description, canecelTitle, continueTitle, variant, handelSumbit }: {
  trigger: string,
  variant?: "default" | "destructive" | "link" | "outline" | "secondary" | "ghost"
  title: string,
  description: string,
  canecelTitle: string,
  continueTitle: string,
  handelSumbit: () => void,
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} >{trigger}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col flex">
          <AlertDialogCancel>{canecelTitle}</AlertDialogCancel>
          <DeleteAccountRequestDialog tag={"Delete my profile"} variant="destructive" setOpen={setOpen} open={open} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}