'use client'
import React from "react";
import { Slider } from "../ui/slider";

import { useNuqsContext } from "@/context/NuqsContentProvider";

export default function DistanceRange() {
  const { filters, setFilters } = useNuqsContext();
  const distance = filters.distance

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Distance from location
      </p>

      <div className="flex px-1 justify-between">
        <span>{distance[0]} Km</span>
        <span>100 Km</span>
      </div>

      <Slider
        value={distance}
        onValueChange={(val) => setFilters({ distance: val })}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  )
}