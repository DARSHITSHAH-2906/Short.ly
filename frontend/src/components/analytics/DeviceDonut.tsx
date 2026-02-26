'use client';

import { useDevices } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Props {
    shortId: string;
    days: number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow">
                <p className="font-medium">{payload[0].name}</p>
                <p className="text-muted-foreground">{payload[0].value} clicks</p>
            </div>
        );
    }
    return null;
};

export function DeviceDonut({ shortId, days }: Props) {
    const user = useAuthStore((state) => state.user);
    const { data, isLoading } = useDevices(shortId, days);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Devices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-56 rounded-lg bg-muted animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    const points = data ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Devices</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                {points.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center pt-16">No device data available</p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={points}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {points.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }}
                                formatter={(value) => <span style={{ color: '#e4e4e7' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
