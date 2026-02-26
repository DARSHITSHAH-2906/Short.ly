"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link2, ArrowRight, Users, TrendingUp, Globe } from 'lucide-react';

const schema = z.object({
    name: z.string().regex(/^[a-zA-Z]+ [a-zA-Z]+$/, "Name Should Contain First Name and Last Name Seperated by Space"),
    email: z.string().email("Invalid Email Address"),
    password: z.string().min(8, "Password must be at least 8 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const { setUser, user } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user])

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });
            setUser(res.data.user);
            router.push('/dashboard');
            toast.success("Account created successfully!");
        } catch (err: any) {
            const msg = err.response?.data?.error || "Registration failed. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex w-1/2">
            <div className="hidden lg:flex flex-col justify-between w-[45%] card-gradient border-r border-border/40 p-12 dot-grid">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/15 border border-primary/30">
                        <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-xl brand-gradient">ShortURL</span>
                </div>

                <div className="space-y-10 max-w-sm">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
                            Join{' '}
                            <span className="brand-gradient">500,000+ users</span>{' '}
                            managing smarter links.
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Get instant access to powerful link shortening, analytics,
                            and management tools — completely free to start.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {[
                            { icon: TrendingUp, label: 'Track every click in real-time' },
                            { icon: Globe, label: 'See where your audience comes from' },
                            { icon: Users, label: 'No credit card required to start' },
                        ].map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                                    <Icon className="h-3.5 w-3.5 text-primary" />
                                </span>
                                {label}
                            </li>
                        ))}
                    </ul>

                    <p className="text-xs text-muted-foreground/60">
                        Free plan includes 25 links/month with full analytics.
                    </p>
                </div>

                <div />
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-7">
                    {/* Logo shown on mobile only */}
                    <div className="flex lg:hidden items-center gap-2 justify-center">
                        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary/15 border border-primary/30">
                            <Link2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold text-lg brand-gradient">ShortURL</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight mb-1">Create your account</h1>
                        <p className="text-sm text-muted-foreground">Free forever. No credit card needed.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Jane Smith"
                                                className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary focus-visible:ring-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary focus-visible:ring-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary focus-visible:ring-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-10 bg-muted/40 border-border/60 focus-visible:border-primary focus-visible:ring-primary/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full h-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold gap-2 mt-2"
                            >
                                Create Account <ArrowRight className="h-4 w-4" />
                            </Button>
                        </form>
                    </Form>

                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
