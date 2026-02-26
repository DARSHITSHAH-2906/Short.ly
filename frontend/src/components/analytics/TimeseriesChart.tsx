'use client';

import { useTimeseries } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
    shortId: string;
    days: number;
}

export function TimeseriesChart({ shortId, days }: Props) {
    const { data, isLoading } = useTimeseries(shortId, days);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Clicks Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 rounded-lg bg-muted animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    const formatted = (data ?? []).map((d) => ({
        ...d,
        date: format(parseISO(d.date), 'MMM dd'),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Clicks Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gUnique" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#18181b',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 8,
                                fontSize: 12,
                                color: '#f4f4f5',
                            }}
                            labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
                            itemStyle={{ color: '#f4f4f5' }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                        <Area
                            type="monotone"
                            dataKey="clicks"
                            name="Total Clicks"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#gClicks)"
                        />
                        <Area
                            type="monotone"
                            dataKey="unique"
                            name="Unique Visitors"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#gUnique)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
