'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UrlForm } from '@/components/UrlForm';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditUrlPage() {
    const { shortId } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (shortId) fetchUrl();
    }, [shortId]);

    const fetchUrl = async () => {
        try {
            const response = await api.get(`/url/details/${shortId}`);
            setData(response.data.data);
        } catch (error) {
            toast.error('Failed to load URL data');
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <Link
            href="/dashboard"
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Edit Link: <span className='text-blue-500'>{`${window.location.protocol}//${window.location.host}/url/${shortId}`}</span></h1>
            <UrlForm initialData={data} onSuccess={() => router.push('/dashboard')} />
        </div>
    );
}
