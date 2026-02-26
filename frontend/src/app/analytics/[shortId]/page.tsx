'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { KpiCards } from '@/components/analytics/KpiCards';
import { TimeseriesChart } from '@/components/analytics/TimeseriesChart';
import { DeviceDonut } from '@/components/analytics/DeviceDonut';
import { ReferrerDonut } from '@/components/analytics/ReferrerDonut';
import { UtmAnalyticsCard } from '@/components/analytics/UtmAnalytics';
import { GeoLocations } from '@/components/analytics/GeoLocations';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DAY_OPTIONS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 3 months', value: '90' },
  { label: 'Last year', value: '365' },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { shortId } = useParams<{ shortId: string }>();
  const user = useAuthStore((state) => state.user);
  const isPremium = user?.subscriptionPlan !== 'FREE';
  const [days, setDays] = useState(7);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      {
        isPremium ?
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center h-9 w-9 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-extrabold tracking-tight brand-gradient">Analytics</h1>
                  </div>
                </div>
              </div>

              <Select
                value={String(days)}
                onValueChange={(v) => setDays(Number(v))}
              >
                <SelectTrigger className="w-44 bg-card border-border/60 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <KpiCards shortId={shortId} days={days} />

            <TimeseriesChart shortId={shortId} days={days} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DeviceDonut shortId={shortId} days={days} />
              <ReferrerDonut shortId={shortId} days={days} />
              <UtmAnalyticsCard shortId={shortId} days={days} />
            </div>

            <GeoLocations shortId={shortId} days={days} />
          </> :
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-indigo-500" />
            </div>
            <h3 className="font-bold text-lg mb-1">Advanced Analytics Locked</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Upgrade to Pro to see exactly which campaigns, platforms, and keywords are driving your traffic.
            </p>
            <Button onClick={() => router.push('/pricing')}>
              Upgrade to Pro
            </Button>
          </div>

      }
    </div>
  );
}