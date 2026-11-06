"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TotalCustomers() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Total Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold mb-4">17,850</p>

        <div className="space-y-2 text-sm">
          <CountryRow name="USA" percent="23%" />
          <CountryRow name="China" percent="20%" />
          <CountryRow name="UK" percent="18%" />
          <CountryRow name="Netherlands" percent="13%" />
        </div>
      </CardContent>
    </Card>
  )
}

function CountryRow({ name, percent }: { name: string; percent: string }) {
  return (
    <div className="flex justify-between">
      <span>{name}</span>
      <span>{percent}</span>
    </div>
  )
}