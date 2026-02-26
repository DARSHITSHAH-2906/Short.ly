'use client';

import { useState } from 'react';
import { useUtmAnalytics } from '@/hooks/useAnalytics'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
    shortId: string;
    days: number;
}

export function UtmAnalyticsCard({ shortId, days }: Props) {
    const [activeTab, setActiveTab] = useState<string>('utmSource');
    
    const { data, isLoading } = useUtmAnalytics(shortId, days, activeTab);

    const utmData = data ?? [];
    
    // Calculate the maximum clicks to scale the bars proportionally.
    // We use a fallback of 1 to prevent division by zero errors.
    const maxClicks = utmData.length > 0 ? Math.max(...utmData.map((d: any) => d.clicks)) : 1;

    return (
        <Card className="col-span-1 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">UTM Performance</CardTitle>
                <CardDescription>Track where your traffic is coming from.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    
                    <TabsList className="grid w-full grid-cols-5 h-8 mb-4">
                        <TabsTrigger value="utmSource" className="text-[10px] sm:text-xs">Source</TabsTrigger>
                        <TabsTrigger value="utmMedium" className="text-[10px] sm:text-xs">Medium</TabsTrigger>
                        <TabsTrigger value="utmCampaign" className="text-[10px] sm:text-xs">Campaign</TabsTrigger>
                        <TabsTrigger value="utmTerm" className="text-[10px] sm:text-xs">Term</TabsTrigger>
                        <TabsTrigger value="utmContent" className="text-[10px] sm:text-xs">Content</TabsTrigger>
                    </TabsList>

                    <div className="min-h-62.5">
                        {isLoading ? (
                            <div className="space-y-4 mt-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                            <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                                        </div>
                                        <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : utmData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <p className="text-sm font-medium text-foreground">No data found</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Share your link with {activeTab.replace('utm', '')} parameters to see data here.
                                </p>
                            </div>
                        ) : (
                            /* THE NEW BAR CHART SECTION */
                            <div className="space-y-5 mt-4">
                                {utmData.map((row: { name: string, clicks: number }, i: number) => {
                                    // Calculate width percentage. Set a minimum of 1% so even small values show a sliver of color.
                                    const percentage = Math.max((row.clicks / maxClicks) * 100, 1);
                                    
                                    return (
                                        <div key={i} className="space-y-1.5 group">
                                            <div className="flex justify-between items-center text-sm">
                                                <span 
                                                    className="font-medium truncate pr-4 text-foreground/90 group-hover:text-foreground transition-colors" 
                                                    title={row.name}
                                                >
                                                    {row.name}
                                                </span>
                                                <span className="text-muted-foreground tabular-nums font-medium">
                                                    {row.clicks.toLocaleString()}
                                                </span>
                                            </div>
                                            {/* The Bar Track */}
                                            <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                                                {/* The Bar Fill */}
                                                <div 
                                                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}