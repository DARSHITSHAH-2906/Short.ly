import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Summary {
    totalClicks: number;
    uniqueVisitors: number;
}

export interface TimeseriesPoint {
    date: string;
    clicks: number;
    unique: number;
}

export interface DevicePoint {
    name: string;
    value: number;
}

export interface UtmAnalyticsPoint {
    name: string;
    clicks: number;
}

export interface LocationPoint {
    country: string;
    city: string;
    clicks: number;
}

export interface ReferrerPoint {
    referrer: string;
    clicks: number;
}

const fetchAnalytics = async <T>(path: string, days: number, utmParam? : string): Promise<T> => {
    const res = await api.get<{ status: string; data: T }>(path, {
        params: { days, utmParam },
    });
    return res.data.data;
};

export const useSummary = (shortId: string, days: number, isPremium : boolean) =>
    useQuery<Summary>({
        queryKey: ['analytics', shortId, 'summary', days],
        queryFn: () => fetchAnalytics<Summary>(`/url/analytics/${shortId}/summary`, days),
        staleTime: 60_000,
        retry : (failureCount , error: any)=>{
            if(error.response?.status === 404) return false; // Don't retry if URL not found
            return failureCount < 3; // Retry up to 3 times for other errors
        },
        enabled: !!shortId && isPremium
    });

export const useTimeseries = (shortId: string, days: number) =>
    useQuery<TimeseriesPoint[]>({
        queryKey: ['analytics', shortId, 'timeseries', days],
        queryFn: () => fetchAnalytics<TimeseriesPoint[]>(`/url/analytics/${shortId}/timeseries`, days),
        staleTime: 60_000,
    });

export const useDevices = (shortId: string, days: number) =>
    useQuery<DevicePoint[]>({
        queryKey: ['analytics', shortId, 'devices', days],
        queryFn: () => fetchAnalytics<DevicePoint[]>(`/url/analytics/${shortId}/devices`, days),
        staleTime: 60_000,
    });

export const useUtmAnalytics = (shortId: string, days: number, param : string) =>
    useQuery<UtmAnalyticsPoint[]>({
        queryKey: ['analytics', shortId, 'utm', days, param],
        queryFn: () => fetchAnalytics<UtmAnalyticsPoint[]>(`/url/analytics/${shortId}/utmData`, days, param),
        staleTime: 60_000,
    });

export const useLocations = (shortId: string, days: number) =>
    useQuery<LocationPoint[]>({
        queryKey: ['analytics', shortId, 'locations', days],
        queryFn: () => fetchAnalytics<LocationPoint[]>(`/url/analytics/${shortId}/locations`, days),
        staleTime: 60_000,
    });

export const useReferrers = (shortId: string, days: number) =>
    useQuery<ReferrerPoint[]>({
        queryKey: ['analytics', shortId, 'referrers', days],
        queryFn: () => fetchAnalytics<ReferrerPoint[]>(`/url/analytics/${shortId}/referrers`, days),
        staleTime: 60_000,
    });
