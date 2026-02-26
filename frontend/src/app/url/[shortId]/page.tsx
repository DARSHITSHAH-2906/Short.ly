'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';

type Status = 'loading' | 'redirecting' | 'not_found' | 'paused' | 'error';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UTMParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

export default function RedirectPage() {
    const { shortId } = useParams<{ shortId: string }>();
    const params = useSearchParams();
    const [status, setStatus] = useState<Status>('loading');
    const [countdown, setCountdown] = useState(3);

    const hasFetched = useRef<boolean>(false);
    const queryString = params.toString();
    const searchSuffix = queryString ? `?${queryString}` : '';

    useEffect(() => {
        if (!shortId) return;

        if (!hasFetched.current) {
            hasFetched.current = true;
        } else {
            return;
        }
        axios.get(`${BACKEND_URL}/url/${shortId}`)
        .then(res => {
            if (res.status === 200) {
                setStatus('redirecting');
            }
        })
        .catch(err => {
            if(err.response?.status === 404) {
                setStatus('not_found');
            } else if (err.response?.status === 403) {
                setStatus('paused');
            } else {
                setStatus('error');
            }
        })
        .finally()
    }, [shortId]);

    useEffect(() => {
        if (status !== 'redirecting') return;

        if (countdown === 0) {
            window.location.href = `${BACKEND_URL}/url/redirect/${shortId}${searchSuffix}`;
            return;
        }

        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [status, countdown, shortId]);

    if (status === 'loading') {
        return (
            <PageShell>
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                <h1 className="text-xl font-semibold mt-4">Looking up your link…</h1>
                <p className="text-sm text-muted-foreground mt-1">This should only take a moment.</p>
            </PageShell>
        );
    }

    if (status === 'redirecting') {
        return (
            <PageShell>
                <div className="relative flex items-center justify-center">
                    <div className="absolute h-24 w-24 rounded-full bg-emerald-500/20 animate-ping" />
                    <CheckCircle2 className="relative h-14 w-14 text-emerald-500" />
                </div>
                <h1 className="text-xl font-semibold mt-6">Redirecting you…</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    You'll be taken to your destination in{' '}
                    <span className="font-bold text-foreground tabular-nums">{countdown}s</span>
                </p>
                <Button
                    className="mt-6"
                    onClick={() => { window.location.href = `${BACKEND_URL}/url/redirect/${shortId}${searchSuffix}`; }}
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Go now
                </Button>
            </PageShell>
        );
    }
    if (status === 'not_found') {
        return (
            <PageShell>
                <XCircle className="h-14 w-14 text-destructive" />
                <h1 className="text-xl font-semibold mt-4">Link not found</h1>
                <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                    This short link doesn't exist or may have been deleted or expired.
                </p>
                <Link href="/">
                    <Button variant="outline" className="mt-6">Go to Homepage</Button>
                </Link>
            </PageShell>
        );
    }
    if (status === 'paused') {
        return (
            <PageShell>
                <XCircle className="h-14 w-14 text-amber-500" />
                <h1 className="text-xl font-semibold mt-4">Link is paused</h1>
                <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                    The owner of this link has temporarily paused it.
                </p>
                <Link href="/">
                    <Button variant="outline" className="mt-6">Go to Homepage</Button>
                </Link>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <XCircle className="h-14 w-14 text-destructive" />
            <h1 className="text-xl font-semibold mt-4">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                We couldn't process this redirect. Please try again later.
            </p>
            <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                <Link href="/"><Button variant="ghost">Home</Button></Link>
            </div>
        </PageShell>
    );
}

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-1">
            {children}
        </div>
    );
}
