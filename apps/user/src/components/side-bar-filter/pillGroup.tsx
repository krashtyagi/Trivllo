'use client'
import React from "react"
import { Button } from "../ui/button"
import { Filters } from "@/context/NuqsContentProvider"
import { LucideIcon } from "lucide-react"

import { useNuqsContext } from "@/context/NuqsContentProvider"


export type PillOption = Record<string, LucideIcon>


type StringArrayFilterKeys = {
  [K in keyof Filters]: Filters[K] extends string[] ? K : never
}[keyof Filters]

type PillGroupProps = {
  // label:"amenities" |""
  options: PillOption
  queryKey?: StringArrayFilterKeys
  value?: string[]
  onChange?: (value: string[]) => void
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

export default function PillGroup({
  options,
  queryKey,
}: PillGroupProps) {
  const { filters, setFilters } = useNuqsContext();

  const selectedValues = queryKey ? filters[queryKey] : []

  const toggle = (val: string) => {
    if (!queryKey) return

    const next = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val]

    setFilters({
      [queryKey]: next,
    })
  }
  const optionss = Object.entries(options).map(([key, value]) => {
    return {
      value: key,
      icon: value,
    }
  })

  const formatLabel = (key: string) => {
    return key
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {optionss.map((opt) => {
        const active = selectedValues.includes(opt.value)
        const Icon = opt.icon

        return (
          <Button
            key={opt.value}
            type="button"
            variant={active ? "default" : "outline"}
            onClick={() => toggle(opt.value)}
            className="rounded-full flex items-center gap-1.5 px-3 py-1.5 h-auto text-xs"
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{formatLabel(opt.value)}</span>
          </Button>
        )
      })}
    </div>
  )
}
export const formatLabel = (key: string) => {
  return key
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};