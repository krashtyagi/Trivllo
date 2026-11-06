"use client"
import { useIsMobile } from '@/hooks/use-mobile'

import React from 'react'

type MobileContextType = {
  ismobile: boolean
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>
}


const MobileContext = React.createContext<MobileContextType | undefined>(undefined)

const MobileValueProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile()

  const value = React.useMemo(
    () => ({
      ismobile: isMobile,
      setIsMobile: () => {}, // optional: remove setter if not needed
    }),
    [isMobile]
  )

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  )
}

export const useMobileValue = () => {
  const context = React.useContext(MobileContext)

  if (!context) {
    throw new Error("useMobileValue must be used inside MobileValueProvider")
  }

  return context
}


export default MobileValueProvider