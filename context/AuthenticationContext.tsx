'use client';

import { createContext, useContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/dashboard'

type AuthContextType = {
    success: boolean;
    user: UserProfile | null;
    setUser: Dispatch<SetStateAction<UserProfile | null>>;
    setSuccess: Dispatch<SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/check-auth`, {
                    withCredentials: true,
                });
                setUser(res.data.user);
                setSuccess(res.data.success);
            } catch (err) {
                setUser(null);
                router.push('/')
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, success, setSuccess }}>
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
