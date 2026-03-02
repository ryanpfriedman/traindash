'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, BookOpen, PresentationIcon,
    CreditCard, Video, ClipboardList, CheckCircle, Loader2, Award, Target
} from 'lucide-react';
import { getCourse, initProgress, getProgress, calculateOverallProgress, saveProgress, getSettings } from '@/lib/storage';
import { Course, CourseFormat, AppSettings } from '@/lib/types';
import SlideViewer from '@/components/viewers/SlideViewer';
import ManualViewer from '@/components/viewers/ManualViewer';
import CardViewer from '@/components/viewers/CardViewer';
import ScriptViewer from '@/components/viewers/ScriptViewer';
import QuizViewer from '@/components/viewers/QuizViewer';
import CertificateModal from '@/components/viewers/CertificateModal';
import SimulationViewer from '@/components/viewers/SimulationViewer';

const FORMAT_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    slideshow: PresentationIcon, manual: BookOpen, cards: CreditCard, script: Video, quiz: ClipboardList, simulation: Target,
};
const FORMAT_LABELS: Record<string, string> = { slideshow: 'Slides', manual: 'Manual', cards: 'Cards', script: 'Script', quiz: 'Quiz', simulation: 'Simulation' };

export default function LearnerView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState(0);
    const [activeTab, setActiveTab] = useState<CourseFormat>('slideshow');
    const [mounted, setMounted] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const load = async () => {
            const c = await getCourse(id);
            if (!c) { router.push('/courses'); return; }
            const s = await getSettings();

            setCourse(c);
            if (c.formats.length > 0) setActiveTab(c.formats[0]);
            setSettings(s);

            // Mark lesson as viewed
            const progress = initProgress(id);
            if (!progress.lessonProgress[c.lessons[0]?.id]) {
                progress.lessonProgress[c.lessons[0]?.id] = {
                    lessonId: c.lessons[0]?.id, viewed: true, quizCompleted: false,
                    quizScore: 0, quizTotal: 0,
                };
                progress.overallPercent = calculateOverallProgress(progress, c.lessons.length);
                saveProgress(progress);
            }

            // Analytics: Fire course_start once per session
            if (!sessionStorage.getItem(`analytics_start_${c.id}`)) {
                sessionStorage.setItem(`analytics_start_${c.id}`, 'true');
                fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'activity', data: { courseId: c.id, eventType: 'course_start' } })
                }).catch(console.error);
            }
            setMounted(true);
        };
        load();
    }, [id, router]);

    const handleLessonChange = (idx: number) => {
        if (!course) return;
        setActiveLesson(idx);
        const lesson = course.lessons[idx];
        const progress = initProgress(id);
        if (!progress.lessonProgress[lesson.id]) {
            progress.lessonProgress[lesson.id] = {
                lessonId: lesson.id, viewed: true, quizCompleted: false,
                quizScore: 0, quizTotal: 0,
            };
            progress.overallPercent = calculateOverallProgress(progress, course.lessons.length);
            saveProgress(progress);
        }
    };

    const progress = mounted ? getProgress(id) : null;
    const overallPct = progress?.overallPercent || 0;

    useEffect(() => {
        if (overallPct === 100 && course && !sessionStorage.getItem(`analytics_complete_${course.id}`)) {
            sessionStorage.setItem(`analytics_complete_${course.id}`, 'true');
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'activity', data: { courseId: course.id, eventType: 'course_complete' } })
            }).catch(console.error);
        }
    }, [overallPct, course]);

    if (!mounted || !course) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    const lesson = course.lessons[activeLesson];
    const brand = course.brandSnapshot;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {showCertificate && course && (
                <CertificateModal course={course} onClose={() => setShowCertificate(false)} />
            )}
            {/* Header */}
            <div style={{
                background: `linear-gradient(135deg, ${brand.primaryColor || '#6366f1'}, ${brand.secondaryColor || '#8b5cf6'})`,
                padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16,
            }}>
                {brand.logoUrl && <img src={brand.logoUrl} alt="Logo" style={{ height: 36, maxWidth: 120, objectFit: 'contain' }} />}
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: 2 }}>{course.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 200, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${overallPct}%`, background: 'white', borderRadius: 2, transition: 'width 0.5s' }} />
                        </div>
                        {overallPct === 100 ? (
                            <button
                                onClick={() => setShowCertificate(true)}
                                style={{
                                    background: 'white', color: 'var(--primary)', border: 'none',
                                    padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem',
                                    fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Award size={14} /> Get Certificate
                            </button>
                        ) : (
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{overallPct}% complete</span>
                        )}
                    </div>
                </div>
                {settings?.role === 'creator' && (
                    <button
                        onClick={() => router.push(`/courses/${course.id}`)}
                        style={{
                            background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
                            padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <ChevronLeft size={14} /> Creator Mode
                    </button>
                )}
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginLeft: 8 }}>
                    Chapter {activeLesson + 1} of {course.lessons.length}
                </span>
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <div style={{
                    width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
                    overflow: 'auto', padding: '12px 8px',
                }}>
                    {course.lessons.map((l, idx) => {
                        const lp = progress?.lessonProgress[l.id];
                        const isActive = idx === activeLesson;
                        const isCompleted = lp?.quizCompleted;
                        return (
                            <button
                                key={l.id}
                                onClick={() => handleLessonChange(idx)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                                    color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)',
                                    transition: 'all 0.15s', marginBottom: 2,
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                }}
                            >
                                <div style={{ flexShrink: 0, marginTop: 2 }}>
                                    {isCompleted
                                        ? <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                                        : <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-block' }} />
                                    }
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2, opacity: 0.7 }}>Ch. {l.order}</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>{l.title}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {/* Tab bar */}
                    <div style={{
                        display: 'flex', gap: 2, padding: '8px 16px',
                        background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)',
                    }}>
                        {course.formats.map((fmt) => {
                            const Icon = FORMAT_ICONS[fmt] || BookOpen;
                            return (
                                <button key={fmt} onClick={() => setActiveTab(fmt)} style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
                                    border: 'none', cursor: 'pointer',
                                    background: activeTab === fmt ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    color: activeTab === fmt ? 'var(--primary-dark)' : 'var(--text-muted)',
                                    fontWeight: activeTab === fmt ? 600 : 400, fontSize: '0.85rem',
                                    transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                                }}>
                                    <Icon size={15} />{FORMAT_LABELS[fmt]}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                        {lesson && activeTab === 'slideshow' && <SlideViewer key={lesson.id} lesson={lesson} brand={brand} courseId={id} />}
                        {lesson && activeTab === 'manual' && <ManualViewer key={lesson.id} lesson={lesson} brand={brand} />}
                        {lesson && activeTab === 'cards' && <CardViewer key={lesson.id} lesson={lesson} />}
                        {lesson && activeTab === 'script' && <ScriptViewer key={lesson.id} lesson={lesson} courseId={id} />}
                        {lesson && activeTab === 'quiz' && <QuizViewer key={lesson.id} lesson={lesson} courseId={id} />}
                        {lesson && activeTab === 'simulation' && <SimulationViewer key={lesson.id} lesson={lesson} brand={settings?.brand as any} courseId={id} />}
                    </div>

                    {/* Nav */}
                    <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleLessonChange(Math.max(0, activeLesson - 1))} disabled={activeLesson === 0}>
                            <ChevronLeft size={14} /> Previous
                        </button>
                        {activeLesson < course.lessons.length - 1 ? (
                            <button className="btn btn-primary btn-sm" onClick={() => handleLessonChange(activeLesson + 1)}>
                                Next Chapter <ChevronRight size={14} />
                            </button>
                        ) : (
                            <div style={{ padding: '8px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                                🎉 Course Complete!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
