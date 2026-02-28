import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '@/lib/api';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface User {
    id: string;
    email: string;
    name: string;
    subscriptionPlan: SubscriptionPlan;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    lastVerifiedAt: number | null;
    setUser: (user : User) => void;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            lastVerifiedAt: null,
            setUser: (user: User) => set({ user, isAuthenticated: true, lastVerifiedAt: Date.now() }),
            logout: async () => {
                try {
                    await api.get('/auth/logout');
                } catch (error) {
                    console.error('Logout failed:', error);
                } finally {
                    set({ user: null, isAuthenticated: false, lastVerifiedAt: null });
                }
            },
            initializeAuth: async () => {
                const FIFTEEN_MINUTES = 15 * 60 * 1000;
                const lastVerifiedAt = get().lastVerifiedAt;
                if(lastVerifiedAt && ((Date.now() - lastVerifiedAt) < FIFTEEN_MINUTES)) {
                    return; // Skip verification if last verified within 15 minutes
                }
                try {
                    console.log("Verifying token");
                    const response = await api.get('/auth/verify-token');
                    const user = response.data?.user;
                    if (user) {
                        set({ user, isAuthenticated: true, lastVerifiedAt: Date.now() });
                    } else {
                        set({ user: null, isAuthenticated: false, lastVerifiedAt: Date.now() });
                    }
                } catch {
                    set({ user: null, isAuthenticated: false, lastVerifiedAt: Date.now() });
                }
            },
        })
        ,
        {
            name: 'auth-storage',
            storage : createJSONStorage(() => localStorage),
        }
));