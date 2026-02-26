import { create } from 'zustand';
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
    isInitialized: boolean;
    setUser: (user: User) => void;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    setUser: (user) => set({ user, isAuthenticated: true }),
    logout: async () => {
        try {
            await api.get('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            set({ user: null, isAuthenticated: false });
        }
    },
    initializeAuth: async () => {
        try {
            const response = await api.get('/auth/verify-token');
            const user = response.data?.user;
            if (user) {
                set({ user, isAuthenticated: true });
            } else {
                set({ user: null, isAuthenticated: false });
            }
        } catch {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isInitialized: true });
        }
    },
}));
