import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
    rating: number | string;
    variant?: "left" | "right";
    className?: string;
};

const RattingBadge = ({ rating, variant = "right", className }: Props) => {
    const roundedStyle =
        variant === "left"
            ? "rounded-tl-none rounded-br-xl rounded-tr-xl rounded-bl-md"
            : "rounded-tr-none rounded-bl-xl rounded-tl-xl rounded-br-md";

    return (
        <div className={cn("flex items-center bg-primary justify-center", roundedStyle, className)}>
            <Badge
                variant="ghost"
            >
                {rating}
            </Badge>
        </div>
    );
};

export default RattingBadge;
