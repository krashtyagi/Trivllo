'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AuthContextProps = {
    reservationDays: number | undefined;
    setReservationDays: React.Dispatch<React.SetStateAction<number | undefined>>;

};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthContextProviderProps {
    children: ReactNode;
}

export const ChartRangesProvider = ({ children }: AuthContextProviderProps) => {
    const [reservationDays, setReservationDays] = useState<number | undefined>(undefined);




    return (
        <AuthContext.Provider
            value={{
                reservationDays,
                setReservationDays,

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useChartRanges = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthContextProvider');
    }

    return context;
};