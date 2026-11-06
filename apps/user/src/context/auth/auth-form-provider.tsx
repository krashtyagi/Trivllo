'use client'
import React from 'react'

type InitialValuesProps={
    currentStep:number,
    setCurrentStep:React.Dispatch<React.SetStateAction<number>>
}
const InitialValues:InitialValuesProps = {
    currentStep:1,
    setCurrentStep:() =>undefined,
}
const authContext = React.createContext(InitialValues)
const {Provider} = authContext
const AuthContextProvider = ({children}:{children:React.ReactNode}) => {
    const [currentStep , setCurrentStep] = React.useState<number>(InitialValues.currentStep)
    const values ={
        currentStep, setCurrentStep
    }
  return (
    <Provider value={values}>{children}</Provider>
  )
}
export const useAuthForm = () =>{
    const state =  React.useContext(authContext)
    return state
}

export default AuthContextProvider