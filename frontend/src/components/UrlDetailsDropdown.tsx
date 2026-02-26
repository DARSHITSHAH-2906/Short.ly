'use client';

import { useRef, useState } from 'react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ChevronDown, ChevronUp, Copy, ExternalLink, Lock, Calendar,
    Tag, Smartphone, BarChart2, Clock, Shield, MousePointerClick,
    ToggleLeft, Hash, Link2, Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface DeviceUrls {
    ios?: string | null;
    android?: string | null;
}

interface UrlData {
    shortId: string;
    originalUrl: string;
    customAlias?: string | null;
    totalClicks: number;
    isActive: boolean;
    expiresAt?: string | null;
    activatesAt?: string | null;
    passwordHash?: string | null;
    deviceUrls?: DeviceUrls | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface Props {
    shortId: string;
    destinationUrl: string;
}

const fmt = (d: string) => format(new Date(d), 'MMM d, yyyy · HH:mm');
const fmtDate = (d: string) => format(new Date(d), 'MMM d, yyyy');

export function UrlDetailsDropdown({ shortId, destinationUrl }: Props) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<UrlData | null>(null);
    const [loading, setLoading] = useState(false);
    const fetched = useRef(false);

    const toggle = async () => {
        if (!open && !fetched.current) {
            setLoading(true);
            try {
                const res = await api.get(`/url/details/${shortId}`);
                setData(res.data.data);
                fetched.current = true;
            } catch {
                toast.error('Could not load URL details');
            } finally {
                setLoading(false);
            }
        }
        setOpen((prev) => !prev);
    };

    const copy = (text: string, label = 'Copied!') => {
        navigator.clipboard.writeText(text);
        toast.success(label);
    };

    const hasUtm = (d: UrlData) =>
        d.utmSource || d.utmMedium || d.utmCampaign || d.utmContent || d.utmTerm;

    const hasDevices = (d: UrlData) =>
        d.deviceUrls?.ios || d.deviceUrls?.android;

    return (
        <div className="border-t border-dashed">
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
                <span className="font-semibold uppercase tracking-wider">Details</span>
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {open && (
                <div className="px-4 pb-5 space-y-5 text-sm">
                    {loading && (
                        <div className="space-y-2 pt-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-4 rounded bg-muted animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loading && data && (
                        <>
                            <section className="space-y-3 pt-1">
                                <SectionLabel>Identity</SectionLabel>

                                <Row icon={<Link2 className="h-3.5 w-3.5" />} label="Short URL">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <a
                                            href={destinationUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-mono text-xs text-indigo-500 hover:underline truncate"
                                        >
                                            {destinationUrl}
                                        </a>
                                        <button onClick={() => copy(destinationUrl, 'Short URL copied!')} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </Row>

                                <Row icon={<ExternalLink className="h-3.5 w-3.5" />} label="Destination">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <a
                                            href={data.originalUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-500 hover:underline truncate max-w-55"
                                            title={data.originalUrl}
                                        >
                                            {data.originalUrl}
                                        </a>
                                        <button onClick={() => copy(data.originalUrl, 'Destination URL copied!')} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </Row>

                                <Row icon={<Hash className="h-3.5 w-3.5" />} label="Short ID">
                                    <Badge variant="outline" className="font-mono text-xs">{data.shortId}</Badge>
                                </Row>

                                {data.customAlias && (
                                    <Row icon={<Tag className="h-3.5 w-3.5" />} label="Custom alias">
                                        <Badge variant="secondary" className="font-mono text-xs">{data.customAlias}</Badge>
                                    </Row>
                                )}
                            </section>

                            <div className="border-t border-dashed" />

                            <section className="space-y-3">
                                <SectionLabel>Stats & Status</SectionLabel>

                                <Row icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Total clicks">
                                    <span className="font-semibold tabular-nums text-foreground">{data.totalClicks.toLocaleString()}</span>
                                </Row>

                                <Row icon={<ToggleLeft className="h-3.5 w-3.5" />} label="Status">
                                    <Badge
                                        variant={data.isActive ? 'default' : 'outline'}
                                        className={`text-xs ${data.isActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-gray-400'}`}
                                    >
                                        {data.isActive ? 'Active' : 'Paused'}
                                    </Badge>
                                </Row>

                                {data.passwordHash && (
                                    <Row icon={<Shield className="h-3.5 w-3.5" />} label="Protection">
                                        <Badge variant="outline" className="text-xs gap-1">
                                            <Lock className="h-2.5 w-2.5" /> Password protected
                                        </Badge>
                                    </Row>
                                )}
                            </section>

                            <div className="border-t border-dashed" />

                            <section className="space-y-3">
                                <SectionLabel>Dates</SectionLabel>

                                {data.createdAt && (
                                    <Row icon={<Clock className="h-3.5 w-3.5" />} label="Created">
                                        <span className="text-xs">{fmt(data.createdAt)}</span>
                                    </Row>
                                )}
                                {data.updatedAt && (
                                    <Row icon={<Clock className="h-3.5 w-3.5" />} label="Last updated">
                                        <span className="text-xs text-muted-foreground">{fmt(data.updatedAt)}</span>
                                    </Row>
                                )}
                                {data.activatesAt && (
                                    <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Activates at">
                                        <span className="text-xs text-emerald-500 font-medium">{fmt(data.activatesAt)}</span>
                                    </Row>
                                )}
                                {data.expiresAt && (
                                    <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Expires at">
                                        <span className="text-xs text-amber-500 font-medium">{fmt(data.expiresAt)}</span>
                                    </Row>
                                )}
                            </section>

                            {hasDevices(data) && (
                                <>
                                    <div className="border-t border-dashed" />
                                    <section className="space-y-3">
                                        <SectionLabel>Device Targeting</SectionLabel>
                                        {data.deviceUrls?.ios && (
                                            <Row icon={<Smartphone className="h-3.5 w-3.5" />} label="iOS">
                                                <a
                                                    href={data.deviceUrls.ios}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-500 hover:underline truncate max-w-50 block"
                                                    title={data.deviceUrls.ios}
                                                >
                                                    {data.deviceUrls.ios}
                                                </a>
                                            </Row>
                                        )}
                                        {data.deviceUrls?.android && (
                                            <Row icon={<Smartphone className="h-3.5 w-3.5" />} label="Android">
                                                <a
                                                    href={data.deviceUrls.android}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-500 hover:underline truncate max-w-50 block"
                                                    title={data.deviceUrls.android}
                                                >
                                                    {data.deviceUrls.android}
                                                </a>
                                            </Row>
                                        )}
                                    </section>
                                </>
                            )}

                            {/* ── SECTION 5: UTM Parameters ──────────────────────── */}
                            {hasUtm(data) && (
                                <>
                                    <div className="border-t border-dashed" />
                                    <section className="space-y-3">
                                        <SectionLabel icon={<BarChart2 className="h-3 w-3" />}>UTM Campaign Tracking</SectionLabel>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                            {[
                                                { key: 'utm_source', label: 'Source', val: data.utmSource },
                                                { key: 'utm_medium', label: 'Medium', val: data.utmMedium },
                                                { key: 'utm_campaign', label: 'Campaign', val: data.utmCampaign },
                                                { key: 'utm_content', label: 'Content', val: data.utmContent },
                                                { key: 'utm_term', label: 'Term', val: data.utmTerm },
                                            ]
                                                .filter((x) => x.val)
                                                .map(({ key, label, val }) => (
                                                    <div key={key} className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                                                        <span className="text-xs font-medium text-foreground truncate" title={val!}>{val}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </section>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Sub-components ─────────────────────────────────────────── */

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            {icon}
            {children}
        </p>
    );
}

function Row({ icon, label, children }: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <span className="text-[11px] text-muted-foreground block mb-0.5">{label}</span>
                <div className="text-foreground">{children}</div>
            </div>
        </div>
    );
}
