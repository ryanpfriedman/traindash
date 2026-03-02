'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { getCourseByShareToken } from '@/lib/storage';
import { Course } from '@/lib/types';

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const load = async () => {
            const c = await getCourseByShareToken(token);
            if (!c) { setNotFound(true); return; }
            if (c.status !== 'published') { setNotFound(true); return; }
            setCourse(c);
            router.replace(`/courses/${c.id}/learn`);
        };
        load();
    }, [token, router]);

    if (notFound) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={28} style={{ color: 'var(--danger)' }} />
                </div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>Course Not Available</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300 }}>
                    This course link is invalid or the course hasn't been published yet.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
    );
}
