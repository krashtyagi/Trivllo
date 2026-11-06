import { AuthContextProvider } from '@/context/auth/AuthContextProvider'
import { ProcessContextProvider } from '@/context/auth/ProcessContextProvider'
import React from 'react'
// import bgImage from "@/auth/gleb-lucky-YaJx-6j0dF4-unsplash.jpg"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContextProvider>
      <ProcessContextProvider>


        <div>{children}</div>
      </ProcessContextProvider>
    </AuthContextProvider>
  )
}

export default layout