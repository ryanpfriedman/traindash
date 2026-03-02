'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    PlusCircle, Search, BookOpen, Globe, Settings, Lock,
    MoreVertical, Trash2, Edit3, ArrowRight, LayoutDashboard,
    PresentationIcon, CreditCard, Video, ClipboardList, LineChart, Archive, FileDown, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCourses, deleteCourse, updateCourseStatus, getSettings, getProfile } from '@/lib/storage';
import { Course } from '@/lib/types';
import PaywallModal from '@/components/PaywallModal';

const FORMAT_ICONS: Record<string, string> = { slideshow: '📊', manual: '📄', cards: '🗂️', script: '🎥', quiz: '📋' };
const STATUS_STYLES: Record<string, string> = { draft: 'badge-warning', published: 'badge-success', archived: 'badge-neutral' };

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [mounted, setMounted] = useState(false);
    const [role, setRole] = useState<'creator' | 'learner'>('creator');
    const [profile, setProfile] = useState<{ subscriptionStatus: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            const c = await getAllCourses();
            const s = await getSettings();
            const p = await getProfile();
            setCourses(c);
            setRole(s.role);
            setProfile(p);
            setMounted(true);
        };
        load();
    }, []);

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.topic.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this course? This cannot be undone.')) return;
        await deleteCourse(id);
        const updated = await getAllCourses();
        setCourses(updated);
        toast.success('Course deleted');
    };

    const handleArchive = async (id: string) => {
        await updateCourseStatus(id, 'archived');
        const updated = await getAllCourses();
        setCourses(updated);
        toast.success('Course archived');
    };

    const handleExport = (course: Course) => {
        toast.promise(import('@/lib/exporters/htmlZipExport').then(m => m.exportHtmlZip(course)), {
            loading: 'Generating offline zip...',
            success: 'Course exported!',
            error: 'Export failed'
        });
    };

    const handlePublish = async (id: string) => {
        await updateCourseStatus(id, 'published');
        const updated = await getAllCourses();
        setCourses(updated);
        toast.success('Course published');
    };

    if (!mounted) return null;

    return (
        <>
            {profile && profile.subscriptionStatus !== 'active' && <PaywallModal />}
            <div className="animate-fade-in" style={{ padding: '40px', minHeight: '100vh', maxWidth: 1200, margin: '0 auto' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 4 }}>My Courses</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{courses.length} course{courses.length !== 1 ? 's' : ''} in your library</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {role === 'creator' && (
                            <>
                                <Link href="/create" className="btn btn-primary">
                                    <PlusCircle size={16} /> New Course
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: 36 }}
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="glass" style={{ padding: '60px', textAlign: 'center', border: '2px dashed var(--border)' }}>
                        <BookOpen size={36} style={{ color: 'var(--text-subtle)', margin: '0 auto 16px' }} />
                        <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>
                            {search ? 'No courses match your search' : 'No courses yet'}
                        </h3>
                        {role === 'creator' && (
                            <Link href="/create" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                                <PlusCircle size={16} /> Create a Course
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map((course) => (
                            <div key={course.id} className="glass" style={{ padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="flex items-center gap-10 mb-2">
                                        <span className={`badge ${STATUS_STYLES[course.status]}`}>{course.status}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                                            {course.lessons.length} chapters · ~{course.totalEstimatedMinutes} min
                                        </span>
                                    </div>
                                    <h3 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {course.title}
                                    </h3>
                                    <div className="flex gap-6 flex-wrap">
                                        {course.formats.map((f) => (
                                            <span key={f} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{FORMAT_ICONS[f]}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    {role === 'creator' && course.status === 'draft' && (
                                        <button className="btn btn-secondary btn-sm" onClick={() => handlePublish(course.id)}>
                                            <Globe size={13} /> Publish
                                        </button>
                                    )}
                                    {role === 'creator' && (
                                        <>
                                            <Link href={`/courses/${course.id}/analytics`} className="btn btn-secondary btn-sm" style={{ padding: '0 12px' }}>
                                                <LineChart size={14} /> Analytics
                                            </Link>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleExport(course)} style={{ padding: '0 12px' }}>
                                                <FileDown size={14} /> Export ZIP
                                            </button>
                                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(course.id)} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                    <Link href={`/courses/${course.id}`} className="btn btn-primary btn-sm">
                                        Open <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
