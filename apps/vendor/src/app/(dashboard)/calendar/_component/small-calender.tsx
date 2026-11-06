"use client"

import React from "react"
import { Calendar } from "@/components/ui/calendar"

export const SmallCalendar: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>()

  React.useEffect(() => {
    setDate(new Date())
  }, [])

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border-none shadow-none bg-transparent "
      captionLayout="dropdown"
    />
  )
}