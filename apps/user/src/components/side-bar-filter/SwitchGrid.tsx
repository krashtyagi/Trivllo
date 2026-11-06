'use client'
import { useNuqsContext } from "@/context/NuqsContentProvider";
import { cn } from "@/lib/utils";
import { IconGrid4x4, IconMenu4 } from "@tabler/icons-react";
import { Button } from "../ui/button";

const SwitchGrids = () => {
    const { setWrap: setIsGroupedItems, wrap: isGroupedItems } = useNuqsContext();

    return (
        <div
            onClick={() => setIsGroupedItems(!isGroupedItems)}
            className="relative flex h-10 w-20 rounded-2xl border border-zinc-300/30 bg-background"
        >
            <div
                className={cn(
                    "absolute top-0 h-10 w-10 rounded-2xl bg-muted transition-all duration-200",
                    isGroupedItems ? "left-0" : "left-10",
                )}
            />

            <Button
                variant="ghost"
                size="icon"
                className="z-10 h-10 w-10 rounded-2xl"
            >
                <IconGrid4x4 />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="z-10 h-10 w-10 rounded-2xl"
            >
                <IconMenu4 />
            </Button>
        </div>
    );
};

export default SwitchGrids;
