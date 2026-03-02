'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, ChevronRight, GraduationCap, Lock, Loader2 } from 'lucide-react';
import { getOrgSettings, getOrgCourses } from '@/lib/storage';
import { Course } from '@/lib/types';

const FORMAT_LABELS: Record<string, string> = { slideshow: 'Slideshow', manual: 'Manual', cards: 'Cards', script: 'Script', quiz: 'Quiz' };

export default function TeamHubPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [mounted, setMounted] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!token) {
                setIsValid(false);
                return;
            }

            const settings = await getOrgSettings(token);
            const allCourses = await getOrgCourses(token);

            if (settings) {
                setIsValid(true);
                setOrgName(settings.brand.companyName || 'Team');
                setCourses(allCourses);
            } else {
                setIsValid(false);
            }

            setMounted(true);
        };
        load();
    }, [token]);

    if (!mounted || isValid === null) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!isValid) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={28} style={{ color: 'var(--danger)' }} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>Invalid Hub Link</h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>
                    This organizational invite link is invalid or has expired. Please contact your administrator for a new link.
                </p>
            </div>
        );
    }

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.topic.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in" style={{ padding: '40px', minHeight: '100vh', maxWidth: 1200, margin: '0 auto' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--primary)', color: 'white', padding: 8, borderRadius: 12, display: 'flex' }}>
                            <GraduationCap size={24} />
                        </div>
                        {orgName} Learning Hub
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>{courses.length} required course{courses.length !== 1 ? 's' : ''} available</p>
                </div>

                <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: 36, width: '100%' }}
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="glass" style={{ padding: '80px 20px', textAlign: 'center', border: '2px dashed var(--border)' }}>
                    <BookOpen size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 8, fontSize: '1.25rem' }}>
                        {search ? 'No courses match your search' : 'No courses available'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {search ? 'Try adjusting your search terms.' : 'Your organization hasn\'t published any courses yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {filtered.map((course) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.id}/learn`}
                            className="glass glass-hover"
                            style={{ padding: '24px', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                        >
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
                                {course.title}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5, flex: 1 }}>
                                {course.description?.substring(0, 120)}{course.description?.length > 120 ? '...' : ''}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                                {course.formats.map((f) => (
                                    <span key={f} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                                        {FORMAT_LABELS[f] || f}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
                                    {course.lessons.length} chapters · ~{course.totalEstimatedMinutes} min
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', gap: 4 }}>
                                    Begin <ChevronRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
