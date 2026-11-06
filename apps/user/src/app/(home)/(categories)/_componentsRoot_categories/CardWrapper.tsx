import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const DetailsPageCardWrapperUI = ({ children, classNameCard, classNameChild }: { children: React.ReactNode, classNameChild?: string, classNameCard?: string }) => {
    return (
        <Card
            className={cn(
                "w-full overflow-hidden md:border border-border/60 bg-card",
                " transition-all duration-300 rounded-2xl mb-4 last:mb-0",
                "dark:hover:shadow-[0_8px_20px_rgba(255,255,255,0.06)]", classNameCard
            )}
        >
            <div
                className={cn(
                    "grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_200px]",
                    "lg:grid-cols-[280px_minmax(0,1fr)_220px]",
                    "md:min-h-[200px] lg:min-h-[220px]", classNameChild
                )}
            >{children}</div></Card>
    )
}