"use client";

import { createContext, useContext, useState, ReactNode } from 'react'

//Define the context type
type ContextType = {
    openDialog: boolean;
    setOpenDialog: (status: boolean) => void;
}

// Create context with default undefined
const Context = createContext<ContextType | undefined>(undefined);

// Provider props type
type ContextProviderProps = {
    children: ReactNode
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    return (
        <Context.Provider value={{ openDialog, setOpenDialog }}>
            {children}
        </Context.Provider>
    )
}

export const useDashboard = (): ContextType => {
    const context = useContext(Context)
    if (!context) {
        throw new Error('useDashboard must be used within a ContextProvider')
    }
    return context
}