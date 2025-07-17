'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

type User = {
    userId: string,
    email: string,
    isVerified: boolean,
};

type AuthContextType = {
    user: User | null;
    success: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // Auto-fetch user on load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-auth`, {
                    withCredentials: true,
                });
                setUser(res.data.userData);
                setSuccess(res.data.success);
            } catch (err) {
                setUser(null);
            }
        };

        fetchUser();
    }, []);
    return (
        <AuthContext.Provider value={{ user, success }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook for using the auth context
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within AuthProvider');
    return context;
};
