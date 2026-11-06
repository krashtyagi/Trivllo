'use client'
import { Slider } from "@/components/ui/slider";
import React from "react";
import { useNuqsContext } from "@/context/NuqsContentProvider";

// type Props = {
//   value: number[];
//   setValue: React.Dispatch<React.SetStateAction<number[]>>;
// };

export default function PriceRange() {
  const { filters, setFilters } = useNuqsContext();
  const DEFAULT_PRICE = [1500, 100000]
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Nightly prices including fees and taxes
      </p>

      <Slider
        value={filters.price}
        onValueChange={(value) => setFilters({ price: value as [number, number] })}
        max={DEFAULT_PRICE[1]}
        step={1}
        className="w-full"
      />

      <div className="flex justify-between px-3 text-sm">
        <div className="flex-col gap-2 items-center flex">
          <p className="text-zinc-50/50">minimum</p>
          <span className="p-2 border dark:border-zinc-100/20 rounded-md w-20 ">₹{filters.price?.[0]}</span>
        </div>
        <div className="flex-col gap-2 items-center flex">
          <p className="text-zinc-50/50">maximum</p>
          <span className="p-2 border dark:border-zinc-100/20 rounded-md w-20">₹{filters.price?.[1]}+</span>
        </div>
      </div>
    </div>
  );
}


