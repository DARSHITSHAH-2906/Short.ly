'use client';

import { UrlForm } from '@/components/UrlForm';
import { useRouter } from 'next/navigation';

export default function CreateUrlPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Create New Link</h1>
            <UrlForm onSuccess={() => router.push('/dashboard')} />
        </div>
    );
}
