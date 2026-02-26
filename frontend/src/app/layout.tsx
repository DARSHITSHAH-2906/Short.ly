import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css"
import { Navbar } from "@/components/Navbar";
import { Background } from "@/components/Background";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "@/components/AuthProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono-custom",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Short.ly — Premium Link Management",
    description: "Shorten, track, and manage your links with powerful analytics.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
            <body className="font-sans">
                <ReactQueryProvider>
                    <AuthProvider>
                        <Background />
                        <Navbar />
                        <main className="min-h-[calc(100vh-64px)] flex flex-col w-full">
                            {children}
                        </main>
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                style: {
                                    background: 'oklch(0.16 0.015 265)',
                                    color: 'oklch(0.95 0.005 265)',
                                    border: '1px solid oklch(1 0 0 / 10%)',
                                    borderRadius: '0.625rem',
                                    fontSize: '0.875rem',
                                    boxShadow: '0 8px 32px oklch(0 0 0 / 40%)',
                                },
                            }}
                        />
                    </AuthProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
