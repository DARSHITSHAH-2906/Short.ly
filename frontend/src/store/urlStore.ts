import { create } from 'zustand';

export interface Url {
    _id: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: string;
    visitCount: number;
}

interface UrlState {
    urls: Url[];
    loading: boolean;
    error: string | null;
    setUrls: (urls: Url[]) => void;
    addUrl: (url: Url) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useUrlStore = create<UrlState>((set) => ({
    urls: [],
    loading: false,
    error: null,
    setUrls: (urls) => set({ urls }),
    addUrl: (url) => set((state) => ({ urls: [url, ...state.urls] })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
