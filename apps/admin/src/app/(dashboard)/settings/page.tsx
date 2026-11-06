import React, { Suspense } from 'react'
import AdminSettingsPage from './_components/main-settings_page'
import { Loader2 } from 'lucide-react'

type Props = {}

const page = (props: Props) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminSettingsPage />
    </Suspense>
  )
}

export default page 