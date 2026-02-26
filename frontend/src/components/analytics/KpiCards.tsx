'use client';

import { useSummary } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointer2, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Props {
    shortId: string;
    days: number;
}

function KpiSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
        </div>
    );
}

export function KpiCards({ shortId, days }: Props) {
    const user = useAuthStore((state) => state.user);
    const isPremium = user?.subscriptionPlan !== 'FREE';
    const { data, isLoading, } = useSummary(shortId, days, isPremium);


    if (isLoading) return <KpiSkeleton />;

    const total = data?.totalClicks ?? 0;
    const unique = data?.uniqueVisitors ?? 0;
    const clicksPerUser = total > 0 ? ((unique / total)).toFixed(2) : '0.0';
    const engagement = total > 0 ? (((total - unique) / total) * 100).toFixed(2) : '0.0';
    const newVistors = total > 0 ? ((unique / total) * 100).toFixed(2) : '0.0';

    const cards = [
        {
            title: 'Total Clicks',
            value: total.toLocaleString(),
            icon: MousePointer2,
            description: `Last ${days} days`,
            color: 'text-blue-500',
        },
        {
            title: 'Unique Visitors',
            value: unique.toLocaleString(),
            icon: Users,
            description: 'Distinct visitors',
            color: 'text-emerald-500',
        },
        {
            title: 'Clicks Per User',
            value: `${clicksPerUser}`,
            icon: TrendingUp,
            description: 'Average clicks per visitor',
            color: 'text-violet-500',
        },
        {
            title: 'Repeat Engagement',
            value: `${engagement}%`,
            icon: TrendingUp,
            description: 'Percentage of repeat visitors',
            color: 'text-violet-500',
        },
        {
            title: 'New Vistors Rate',
            value: `${newVistors}%`,
            icon: TrendingUp,
            description: 'Percentage of new visitors',
            color: 'text-violet-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({ title, value, icon: Icon, description, color }) => (
                <Card key={title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                        <Icon className={`h-4 w-4 ${color}`} />
                    </CardHeader>
                    <CardContent>
                            <p className="text-3xl font-bold">{value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
