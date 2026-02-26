'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const hasInitialised = useRef<boolean>(false);

    useEffect(() => {
        // Prevent multiple calls to initializeAuth during development due to React.StrictMode
        if(!hasInitialised.current) {
            initializeAuth();
            hasInitialised.current = true;
        }
    }, [initializeAuth]);
    return <>{children}</>;
}
