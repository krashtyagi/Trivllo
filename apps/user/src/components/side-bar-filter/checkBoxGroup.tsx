'use client'
import { Checkbox } from "@/components/ui/checkbox"
import {
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react"
import { Filters, useNuqsContext } from "@/context/NuqsContentProvider"

export default function CheckboxGroup({
  options,
  stars,
  queryKey,
}: {
  options: {
    value: number
    label: string
  }[]
  queryKey: keyof Filters
  stars?: boolean
}) {
  const { filters, setFilters } = useNuqsContext();
  // Get current selected values safely
  const current = (filters[queryKey] as string[]) ?? []

  const toggle = (value: number) => {
    const stringValue = String(value)

    const next = current.includes(stringValue)
      ? current.filter((v) => v !== stringValue)
      : [...current, stringValue]

    setFilters((prev) => ({
      ...prev,
      [queryKey]: next
    }))
  }

  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const stringValue = String(opt.value)
        const checked = current.includes(stringValue)

        return (
          <label
            key={i}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => toggle(opt.value)}
            />

            {stars && (
              <div className="flex gap-0.5">
                {[...Array(opt.value)].map((_, i) => (
                  <IconStarFilled
                    key={`filled-${i}`}
                    className="size-3 text-yellow-500"
                  />
                ))}
                {[...Array(5 - opt.value)].map((_, i) => (
                  <IconStar
                    key={`empty-${i}`}
                    className="size-3 text-muted-foreground"
                  />
                ))}
              </div>
            )}

            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}