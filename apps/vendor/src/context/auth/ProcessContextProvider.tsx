'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AuthContextProps = {
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetSteps: () => void;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthContextProviderProps {
    children: ReactNode;
}

export const ProcessContextProvider = ({ children }: AuthContextProviderProps) => {
    const [currentStep, setCurrentStep] = useState<number>(2);

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    };

    const goToStep = (step: number) => {
        setCurrentStep(Math.max(0, step));
    };

    const resetSteps = () => {
        setCurrentStep(0);
    };


    return (
        <AuthContext.Provider
            value={{
                currentStep,
                setCurrentStep,
                nextStep,
                prevStep,
                goToStep,
                resetSteps,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useProcessContext = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthContextProvider');
    }

    return context;
};