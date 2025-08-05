"use client";

import { createContext, useContext, useState, ReactNode } from 'react'

//Define the context type
type ContextType = {
    openAddMemberModal: boolean;
    setOpenAddMemberModal: (status: boolean) => void;
}

// Create context with default undefined
const Context = createContext<ContextType | undefined>(undefined);

// Provider props type
type ContextProviderProps = {
    children: ReactNode
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [openAddMemberModal, setOpenAddMemberModal] = useState<boolean>(false);

    return (
        <Context.Provider value={{ openAddMemberModal, setOpenAddMemberModal,  }}>
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