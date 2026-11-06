import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-zinc-200/80",
        className
      )}
      {...props}
    />
  )
}
export function HotelPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full py-4 md:py-8">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 px-4 md:px-10 max-w-screen-2xl mx-auto w-full">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <Skeleton className="h-6 sm:h-7 md:h-8 w-[80%] max-w-[600px] rounded-md" />
            <Skeleton className="h-4 sm:h-5 w-[150px] rounded-md" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-[250px] rounded-md" />
        </div>
      </div>

      {/* TabsLine Container */}
      <div className="w-full border-t border-border mt-2">
        <div className="mx-auto w-full max-w-screen-2xl px-4 md:px-6 lg:px-10">

          {/* Overview / LayoutGridDemo Skeleton */}
          <section className="py-3 -mx-5 md:mx-0">
            <div className="grid grid-cols-2 md:gap-1 gap-0.5 rounded-xl md:rounded-2xl overflow-hidden w-full aspect-[4/3] md:aspect-auto xl:h-[430px] md:h-[300px]">
              {/* Left half: 1 large image */}
              <div className="h-full w-full block">
                <Skeleton className="h-full w-full rounded-none" />
              </div>
              {/* Right half: 2x2 grid of 4 images */}
              <div className="h-full w-full grid grid-cols-2 grid-rows-2 gap-0.5 md:gap-1">
                <Skeleton className="h-full w-full rounded-none" />
                <Skeleton className="h-full w-full rounded-none" />
                <Skeleton className="h-full w-full rounded-none" />
                <Skeleton className="h-full w-full rounded-none" />
              </div>
            </div>
          </section>

          {/* Sticky Tab Bar Skeleton */}
          <div className="h-16 flex items-center -mx-4 px-4 md:px-6 mb-8 border-b border-t border-border">
            <div className="flex gap-6 overflow-hidden">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>

          {/* Main Content & Sidebar Skeleton */}
          <div className="flex flex-col lg:flex-row lg:gap-6 mb-5">
            <main className="flex-1 space-y-5 border-b-1 mb-4">
              <section className="py-2 gap-4 flex flex-col">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[60%]" />
              </section>
            </main>

            <aside className="lg:w-[380px] flex-shrink-0">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
export { Skeleton }
