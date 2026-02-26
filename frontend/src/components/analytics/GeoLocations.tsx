'use client';

import { useLocations } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import iso3166 from 'iso-3166-1';

// The official, highly reliable TopoJSON used by react-simple-maps
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface Props {
    shortId: string;
    days: number;
}

export function GeoLocations({ shortId, days }: Props) {
    const { data, isLoading } = useLocations(shortId, days);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Top Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="h-48 w-full rounded bg-muted animate-pulse mb-6" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    const locations = data ?? [];

    const countryMap = new Map<string, number>();
    locations.forEach(({ country, clicks }) => {
        countryMap.set(country, (countryMap.get(country) ?? 0) + clicks);
    });

    const topCountries = Array.from(countryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const maxClicks = topCountries[0]?.[1] ?? 1;

    const getDensityColor = (clicks: number) => {
        if (!clicks) return "#F3F4F6";
        const ratio = clicks / maxClicks;

        if (ratio > 0.8) return "#4338CA";
        if (ratio > 0.5) return "#4F46E5";
        if (ratio > 0.2) return "#6366F1";
        return "#A5B4FC";
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Global Footprint</CardTitle>
            </CardHeader>
            <CardContent>
                {locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No location data available</p>
                ) : (
                    <div className="space-y-6">

                        <div className="w-full bg-slate-50/50 rounded-lg border overflow-hidden">
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{ scale: 110, center: [0, 30] }}
                                height={300}
                            >
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => {
                                            // 1. world-atlas uses a 3-digit numeric string for geo.id (e.g., "840")
                                            const numericId = geo.id;

                                            let clicks = 0;
                                            let countryName = "Unknown";

                                            // 2. Translate the numeric ID back to the Alpha-2 code to check our map
                                            if (numericId) {
                                                const countryInfo = iso3166.whereNumeric(numericId);
                                                if (countryInfo) {
                                                    // Now we have the matching 'US', 'IN', etc.
                                                    clicks = countryMap.get(countryInfo.alpha2) || 0;
                                                    countryName = countryInfo.country;
                                                }
                                            }

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={getDensityColor(clicks)}
                                                    stroke="#FFFFFF"
                                                    strokeWidth={0.5}
                                                    style={{
                                                        default: { outline: "none" },
                                                        hover: { fill: "#312E81", outline: "none", transition: "all 250ms" },
                                                        pressed: { outline: "none" },
                                                    }}
                                                >
                                                    <title>
                                                        {countryName}: {clicks} clicks
                                                    </title>
                                                </Geography>
                                            );
                                        })
                                    }
                                </Geographies>
                            </ComposableMap>
                        </div>
                    </div>
                )}
                <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 mt-2">
                        Top Cities
                    </p>
                    <ul className="space-y-2">
                        {locations.slice(0, 5).map((loc, i) => (
                            <li key={i} className="flex justify-between text-sm">
                                <span>
                                    {loc.city}, <span className="text-muted-foreground text-xs">{loc.country}</span>
                                </span>
                                <span className="tabular-nums font-medium">{loc.clicks}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}