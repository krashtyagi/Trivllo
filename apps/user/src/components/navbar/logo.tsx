import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { RouterPush } from "../RouterPush";

type Props = {};

const LOGO = (props: Props) => {
  const ismobile = useIsMobile();
  const navigate = useRouter();
  return (
    <div
      className={cn(
        "flex flex-col justify-center cursor-pointer select-none transition-transform hover:scale-[1.02] shrink-0",
        ismobile ? "h-11" : "h-14"
      )}
      onClick={() => {
        RouterPush(navigate, "/");
      }}
    >
      <div className="flex items-center gap-1.5 h-8 md:h-9 shrink-0">
        <img
          src="/logo.png"
          alt="Trivllo"
          className="h-full w-auto object-contain shrink-0"
        />
      </div>
      <span className="text-[9px] md:text-[11px] font-medium text-muted-foreground tracking-tight whitespace-nowrap block sm:hidden xl:block -mt-0.5">
        Book Hotels & Tours in India
      </span>
    </div>
  );
};

export default LOGO;
