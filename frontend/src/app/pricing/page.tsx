"use client";

import Link from "next/link";
import { Check, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const PLANS = [
    {
        id: "FREE",
        name: "Free",
        price: 0,
        period: "forever",
        description: "Perfect for personal use and trying out Short.ly.",
        icon: Sparkles,
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/10 border-emerald-400/20",
        accentColor: "border-emerald-400/30",
        buttonVariant: "outline" as const,
        buttonLabel: "Get started free",
        badge: null,
        credits: 10,
        features: [
            "10 short links / month",
            "Basic click analytics",
            "Link expiration dates",
            "Standard redirect speed",
            "Community support",
        ],
        missing: [
            "Custom branded domains",
            "Password-protected links",
            "Bulk link creation",
            "API access",
            "Priority support",
        ],
    },
    {
        id: "PRO",
        name: "Pro",
        price: 9,
        period: "/ month",
        description: "For creators, marketers and growing teams.",
        icon: Zap,
        iconColor: "text-indigo-400",
        iconBg: "bg-indigo-400/10 border-indigo-400/20",
        accentColor: "border-indigo-500",
        buttonVariant: "default" as const,
        buttonLabel: "Upgrade to Pro",
        badge: "Most Popular",
        credits: 500,
        features: [
            "500 short links / month",
            "Full real-time analytics",
            "Password-protected links",
            "Custom branded domains",
            "Bulk link creation (CSV)",
            "REST API access",
            "Email support",
        ],
        missing: [
            "Dedicated SLA",
            "SSO / SAML login",
            "Custom contract",
        ],
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: 49,
        period: "/ month",
        description: "Unlimited scale with dedicated support and SLA.",
        icon: Building2,
        iconColor: "text-violet-400",
        iconBg: "bg-violet-400/10 border-violet-400/20",
        accentColor: "border-violet-500/40",
        buttonVariant: "outline" as const,
        buttonLabel: "Contact sales",
        badge: null,
        credits: -1, // unlimited
        features: [
            "Unlimited short links",
            "Advanced analytics & exports",
            "Password-protected links",
            "Multiple custom domains",
            "Bulk link creation (CSV / API)",
            "Full REST & Webhook API",
            "SSO / SAML login",
            "Dedicated 99.9% SLA",
            "Priority phone & email support",
            "Custom contract & invoicing",
        ],
        missing: [],
    },
];

export default function PricingPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    const handleCTA = (planId: string) => {
        if (planId === "ENTERPRISE") {
            window.location.href = "mailto:sales@short.ly";
            return;
        }
        if (isAuthenticated) {
            router.push("/dashboard");
        } else {
            router.push(planId === "FREE" ? "/register" : "/register");
        }
    };

    return (
        <div className="w-full">
            {/* ── Hero ── */}
            <section className="relative py-20 text-center px-6 dot-grid overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px]" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
                        <Sparkles className="h-3 w-3" />
                        Simple, transparent pricing
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Plans for every{" "}
                        <span className="brand-gradient">stage of growth</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Start free, scale as you grow. No hidden fees. Cancel anytime.
                    </p>
                </div>
            </section>

            {/* ── Plans Grid ── */}
            <section className="max-w-6xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        const isPro = plan.id === "PRO";

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border p-8 card-gradient shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${isPro
                                        ? `${plan.accentColor} shadow-indigo-500/10 hover:shadow-indigo-500/20`
                                        : `${plan.accentColor} border-white/[0.07]`
                                    }`}
                            >
                                {/* Popular badge */}
                                {plan.badge && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide shadow-lg shadow-primary/30">
                                            <Zap className="h-3 w-3" />
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Header */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`flex items-center justify-center h-11 w-11 rounded-xl border shrink-0 ${plan.iconBg}`}>
                                        <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{plan.name}</h2>
                                        <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                                            {plan.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-extrabold tracking-tight">
                                            {plan.price === 0 ? "Free" : `$${plan.price}`}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {plan.credits === -1
                                            ? "Unlimited credits"
                                            : `${plan.credits} credits included`}
                                    </p>
                                </div>

                                {/* CTA */}
                                <Button
                                    variant={plan.buttonVariant}
                                    onClick={() => handleCTA(plan.id)}
                                    className={`w-full mb-8 font-semibold ${isPro
                                            ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                            : ""
                                        }`}
                                >
                                    {plan.buttonLabel}
                                </Button>

                                {/* Divider */}
                                <div className="border-t border-border/40 mb-6" />

                                {/* Features */}
                                <ul className="space-y-3 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm">
                                            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                    {plan.missing.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through decoration-muted-foreground/30">
                                            <span className="h-4 w-4 shrink-0 mt-0.5 flex items-center justify-center">
                                                <span className="h-[2px] w-3 bg-muted-foreground/30 rounded" />
                                            </span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* ── FAQ note ── */}
                <p className="text-center text-sm text-muted-foreground mt-12">
                    All plans include SSL-secured links, 99.9% uptime, and GDPR-compliant data handling.{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Sign in
                    </Link>{" "}
                    to manage your subscription.
                </p>
            </section>
        </div>
    );
}
