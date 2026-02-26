'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Link2, Zap, Shield, BarChart2, Globe, Lock, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
    { value: '10M+', label: 'Links Created' },
    { value: '500K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '<50ms', label: 'Redirect Time' },
];

const FEATURES = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Edge-optimised redirects processed in under 50ms, globally distributed.', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Password protection, expiry dates, and 99.9% uptime backed by enterprise infrastructure.', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    { icon: BarChart2, title: 'Deep Analytics', desc: 'Real-time clicks, geo heatmaps, device breakdown, referrers, and UTM tracking.', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
    { icon: Globe, title: 'Device Targeting', desc: 'Redirect iOS and Android users to different destinations automatically.', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
    { icon: Lock, title: 'Password Links', desc: 'Gate your links behind a password to control who can access them.', color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/20' },
    { icon: MousePointerClick, title: 'Custom Aliases', desc: 'Brand your links with memorable custom slugs instead of random characters.', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
];

/* ── Framer-motion variants ───────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
};

/* ── Floating orb ─────────────────────────────────────────── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
    return (
        <motion.div
            className={`absolute rounded-full pointer-events-none ${className}`}
            animate={{ y: [0, -22, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
        />
    );
}

/* ── Animated SVG grid lines ──────────────────────────────── */
function GridLines() {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                {/* Fade mask — grid fades at edges */}
                <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="gridMask">
                    <rect width="100%" height="100%" fill="url(#gridFade)" />
                </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
        </svg>
    );
}

export default function Home() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)]">

            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">

                {/* Animated grid */}
                <GridLines />

                {/* Floating orbs */}
                <FloatingOrb className="w-130 h-130 bg-indigo-500/15 blur-[120px] -top-20 -left-24" delay={0} />
                <FloatingOrb className="w-95 h-95 bg-violet-500/12 blur-[100px] bottom-10 -right-20" delay={2.5} />
                <FloatingOrb className="w-65 h-65 bg-pink-500/8  blur-[90px]  bottom-32 left-[15%]" delay={4} />

                {/* Content */}
                <motion.div
                    className="relative z-10 flex flex-col items-center max-w-4xl"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-8 tracking-wide uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            Advanced Analytics · Now Live
                        </div>
                    </motion.div>

                    <motion.h1
                        className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08]"
                    >
                        Shorten Your Links,{' '}
                        <br />
                        <span className="brand-gradient">Expand Your Reach.</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
                    >
                        A premium URL shortener built for modern brands. Track every click,
                        understand your audience, and manage links with powerful analytics.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="group bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 px-8 text-base font-semibold"
                            >
                                Get Started — It's Free
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 text-base font-semibold border-border/60 hover:border-primary/50 hover:bg-primary/5"
                            >
                                Sign In
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Floating mini-card hint */}
                    <motion.div
                        className="mt-14 flex items-center gap-3 px-5 py-3 rounded-2xl card-gradient border border-white/8 shadow-xl shadow-black/20"
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/15 border border-primary/30 shrink-0">
                            <Link2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-muted-foreground">Your link</p>
                            <p className="text-sm font-semibold font-mono">short.ly/<span className="text-primary">xK9mP</span></p>
                        </div>
                        <div className="ml-4 text-right">
                            <p className="text-xs text-muted-foreground">Clicks today</p>
                            <motion.p
                                className="text-sm font-bold text-emerald-400 tabular-nums"
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            >
                                ↑ 1,247
                            </motion.p>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            <section className="border-y border-border/40 bg-muted/20">
                <div className="container py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="flex flex-col items-center text-center gap-1">
                            <span className="text-3xl font-extrabold brand-gradient">{value}</span>
                            <span className="text-sm text-muted-foreground font-medium">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container py-24">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                        Everything you need to{' '}
                        <span className="brand-gradient">manage your links</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        From creation to analysis — a complete toolkit built for professionals.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                        <div
                            key={title}
                            className="group relative p-6 rounded-2xl card-gradient border border-white/[0.07] hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-primary/8"
                        >
                            <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${bg} border mb-4`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <h3 className="text-base font-bold mb-1.5">{title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-t border-border/40">
                <div className="container py-20 flex flex-col items-center text-center gap-6">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30">
                        <Link2 className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Ready to supercharge your links?
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                        Join thousands of marketers and developers who trust Short.ly every day.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 px-10 font-semibold">
                            Start for Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
