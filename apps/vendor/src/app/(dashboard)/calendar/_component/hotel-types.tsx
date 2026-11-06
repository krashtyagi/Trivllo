"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Divide, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { id } from "date-fns/locale";

type hoteTypesPropos = {
  _id: string;
  totalRooms: number;
  name: string;
  basePrice: number;
  discountPrice: number;
};

import BigCalender from "./big-calander";
import { MessageModal } from "../../(categories)/rooms/_components/RoomsListing";

type Props = {};

const MainCalenderFrame = (props: Props) => {
  const [selected, setSelected] = React.useState<string | null>("");

  return (
    <>
      <div>
        <ItemGroupExample
          selected={selected}
          setSelected={(v) => setSelected(v)}
        />
      </div>
      {selected ? (
        <BigCalender selected={selected} />
      ) : (
        <MessageModal className="w-full min-h-screen" title="calender" description="select any roomtype" imgsrc="/selectRoomType.png" />
      )}
    </>
  );
};

export default MainCalenderFrame;

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useGetRoomTypes } from "./querys";
import { cn } from "@/lib/utils";
import { PageSkeleton, SkeletonText } from "../../(categories)/rooms/_components/details.skeleton";
import { useCurrentUser } from "@/services/queryes";

export function ItemGroupExample({
  selected,
  setSelected,
}: {
  selected: string | null;
  setSelected: (value: React.SetStateAction<string | null>) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  // const { data: user } = useCurrentUser();
  const { data, isLoading } = useGetRoomTypes();
  const types = data?.data ?? ([] as hoteTypesPropos[]);

  const router = useRouter();

  return (
    <div
      className={cn(
        "border rounded-md bg-card shadow-sm overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-full md:h-screen",
        collapsed ? "w-12" : "md:w-[269px]",
      )}
    >
      {/* Always-visible toggle header */}
      <div className="flex items-center justify-start p-2  bg-muted/40">

        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", collapsed && "fixed mt-7 h-7 w-8")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        {!collapsed && <p className="text-sm font-medium">Rooms Types</p>}
      </div>

      {/* Content — hidden when collapsed */}
      {!collapsed && (
        <div
          className={cn(
            "transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-full opacity-100 ",
          )}
        >
          <ItemGroup className="p-2 gap-1.5">
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Add Rooms Category</ItemTitle>
                <ItemDescription>You can add rooms types</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => router.push("/rooms/new")}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </ItemActions>
            </Item>

            {isLoading ? (
              <div className="py-6 text-center text-muted-foreground text-sm">
                <SkeletonText />
                <SkeletonText />
                <SkeletonText />
              </div>
            ) : (
              types.map((value: hoteTypesPropos) => (
                <Item
                  key={value._id}
                  variant={selected === value._id ? "outline" : "default"}
                  onClick={() => setSelected(value._id)}
                  className={cn("cursor-pointer", selected === value._id ? "dark:bg-background/20 bg-gray-100" : "")}
                >
                  <ItemContent className="gap-0.5">
                    <ItemTitle className="text-sm">{value.name}</ItemTitle>
                    <ItemDescription className="text-xs">
                      Base: ₹{value.basePrice}{" "}
                      {value.discountPrice && `• Disc: ₹${value.discountPrice}`}
                    </ItemDescription>
                  </ItemContent>
                  {/* <ItemActions>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-7 w-7"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </ItemActions> */}
                </Item>
              ))
            )}
          </ItemGroup>
        </div>
      )}
    </div>
  );
}
