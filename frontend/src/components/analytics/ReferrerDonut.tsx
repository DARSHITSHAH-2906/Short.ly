'use client';

import { useReferrers } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { GitBranch } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface Props {
    shortId: string;
    days: number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow">
                <p className="font-medium truncate max-w-50">{payload[0].name}</p>
                <p className="text-muted-foreground">{payload[0].value} clicks</p>
            </div>
        );
    }
    return null;
};

export function ReferrerDonut({ shortId, days }: Props) {
    const { data, isLoading } = useReferrers(shortId, days);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 rounded-lg bg-muted animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    const points = data ?? [];
    const total = points.reduce((s, d) => s + d.clicks, 0);
    const top3 = points.slice(0, 3);

    // Format referrer label — strip protocol for display
    const label = (ref: string) =>
        ref.replace(/^https?:\/\//, '').replace(/^www\./, '');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Referrers</CardTitle>
            </CardHeader>
            <CardContent>
                {points.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-10">No referrer data available</p>
                ) : (
                    <div className="space-y-4">
                        {/* Donut chart */}
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={points}
                                        dataKey="clicks"
                                        nameKey="referrer"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={52}
                                        outerRadius={76}
                                        paddingAngle={3}
                                        label={false}
                                    >
                                        {points.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top 3 referrers */}
                        <div className="space-y-2 pt-1 border-t">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Top Sources</p>
                            {top3.map((d, i) => {
                                const pct = total > 0 ? ((d.clicks / total) * 100).toFixed(1) : '0';
                                return (
                                    <div key={d.referrer} className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ background: COLORS[i % COLORS.length] }}
                                        />
                                        <span className="text-sm flex-1 truncate" title={d.referrer}>
                                            {label(d.referrer)}
                                        </span>
                                        <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                                        <span className="text-xs font-semibold tabular-nums w-10 text-right">{d.clicks}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
