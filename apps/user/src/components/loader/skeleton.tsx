"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "../ui/separator"

export function PageSkeleton() {
  return (
      <div className="min-w-full flex">
        <Card className="w-full  h-full">
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <PlaneSkeleton/>
      </CardContent>
    </Card>
      </div>
      
  )
}
export const PlaneSkeleton = ()=>{
  return (
    <div className="min-w-full flex">
        <Card className="w-full  h-full">
     <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
       </Card>
      </div>
  )
}

export function SkeletonAvatar() {
  return (
    <>
    <div className="flex w-full items-center gap-4">
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <div className="grid gap-2 w-full">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      
    </div>
    <Separator/></>
  )
}

export function SkeletonText() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
export function HotelsCardSkleton() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-42 w-3/4" />
    </div>
  )
}