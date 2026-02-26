"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Link2, ChevronDown, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
];

export const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!mounted) return null;

    return (
        <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-indigo-500/0 via-indigo-500 to-violet-500/0" />

            <div className="w-full px-6 flex h-16 items-center">

                <div className="flex-1 flex items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/15 border border-primary/30 group-hover:bg-primary/25 transition-colors">
                            <Link2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight brand-gradient">
                            Short.ly
                        </span>
                    </Link>
                </div>

                <div className="hidden sm:flex items-center gap-1">
                    {NAV_LINKS.map(({ label, href }) => (
                        <Link key={href} href={href}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground font-medium hover:cursor-pointer"
                            >
                                {label}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="flex-1 flex items-center justify-end gap-3">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-sm font-medium"
                                >
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 border border-primary/30 text-primary shrink-0">
                                        <User className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="hidden sm:inline max-w-[120px] truncate">
                                        {user?.name ?? 'Account'}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                    onClick={() => router.push('/dashboard')}
                                    className="gap-2 cursor-pointer"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
};
