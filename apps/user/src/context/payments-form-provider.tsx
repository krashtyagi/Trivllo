"use client"
import React from 'react'

type PaymentsContextProviderProps = {
    currentstep: number
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>
    children: React.ReactNode
}
const initialContext: PaymentsContextProviderProps = {
    currentstep: 2,
    setCurrentStep: () => { },
    children: null
}

const PaymentsContext = React.createContext<PaymentsContextProviderProps | undefined>(initialContext)

const PaymentsContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentstep, setCurrentStep] = React.useState<number>(2)
    return (
        <PaymentsContext.Provider value={{ currentstep, setCurrentStep, children }}>{children}</PaymentsContext.Provider>
    )
}

export default PaymentsContextProvider

export const usePaymentsContext = () => {
    const context = React.useContext(PaymentsContext)
    if (!context) {
        throw new Error("usePaymentsContext must be used within a PaymentsContextProvider")
    }
    return context
}
