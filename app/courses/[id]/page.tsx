'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Download, Share2, Globe, Lock, Copy,
    BookOpen, PresentationIcon, CreditCard, Video, ClipboardList,
    Loader2, Users, FileDown, Presentation, FileText,
    Edit3, Save, X, Sparkles, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourse, saveCourse, getSettings } from '@/lib/storage';
import { expandChapterContent } from '@/lib/ai';
import { Course, CourseFormat } from '@/lib/types';
import SlideViewer from '@/components/viewers/SlideViewer';
import ManualViewer from '@/components/viewers/ManualViewer';
import CardViewer from '@/components/viewers/CardViewer';
import ScriptViewer from '@/components/viewers/ScriptViewer';
import QuizViewer from '@/components/viewers/QuizViewer';
import SimulationViewer from '@/components/viewers/SimulationViewer';

const FORMAT_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
    slideshow: PresentationIcon,
    manual: BookOpen,
    cards: CreditCard,
    script: Video,
    quiz: ClipboardList,
    simulation: Target,
};
const FORMAT_LABELS: Record<string, string> = { slideshow: 'Slideshow', manual: 'Manual', cards: 'Cards', script: 'Script', quiz: 'Quiz', simulation: 'Simulation' };

export default function CourseViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<CourseFormat>('slideshow');
    const [activeLesson, setActiveLesson] = useState(0);
    const [exporting, setExporting] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState('');
    const [mounted, setMounted] = useState(false);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editedLesson, setEditedLesson] = useState<any>(null);
    const [showExpandModal, setShowExpandModal] = useState(false);
    const [expandInstructions, setExpandInstructions] = useState('');
    const [isExpanding, setIsExpanding] = useState(false);

    useEffect(() => {
        const load = async () => {
            const c = await getCourse(id);
            if (!c) { router.push('/courses'); return; }
            setCourse(c);
            if (c.formats.length > 0) setActiveTab(c.formats[0]);
            setShareUrl(`${window.location.origin}/share/${c.shareToken}`);
            setMounted(true);
        };
        load();
    }, [id, router]);

    const handlePublish = async () => {
        if (!course) return;
        const updated = { ...course, status: 'published' as const, updatedAt: new Date().toISOString() };
        await saveCourse(updated);
        setCourse(updated);
        toast.success('Course published! Share link is now active.');
    };

    const handleCopyShare = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied!');
    };

    const handleStartEdit = () => {
        if (!course) return;
        setEditedLesson(JSON.parse(JSON.stringify(course.lessons[activeLesson])));
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (!course || !editedLesson) return;
        const updatedCourse = { ...course };
        updatedCourse.lessons[activeLesson] = editedLesson;
        await saveCourse(updatedCourse);
        setCourse(updatedCourse);
        setIsEditing(false);
        toast.success('Chapter saved!');
    };

    const handleExpandAI = async () => {
        if (!course || !editedLesson) return;
        setIsExpanding(true);
        const settings = await getSettings();
        try {
            const result = await expandChapterContent(
                settings.api,
                course.title,
                editedLesson,
                expandInstructions
            );

            setEditedLesson({
                ...editedLesson,
                slides: result.slides || editedLesson.slides,
                manualContent: result.manualContent || editedLesson.manualContent,
                cards: result.cards || editedLesson.cards,
                scriptScenes: result.scriptScenes || editedLesson.scriptScenes,
                quiz: result.quiz || editedLesson.quiz,
                estimatedMinutes: result.estimatedMinutes || editedLesson.estimatedMinutes
            });
            setShowExpandModal(false);
            setExpandInstructions('');
            toast.success('Chapter expanded successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to expand content');
        } finally {
            setIsExpanding(false);
        }
    };

    const handleExportPdf = async () => {
        if (!course) return;
        setExporting('pdf');
        try {
            const { exportCourseManualPdf } = await import('@/lib/exporters/pdfExport');
            await exportCourseManualPdf(course);
            toast.success('Manual PDF exported!');
        } catch (e) {
            toast.error('Export failed: ' + (e instanceof Error ? e.message : 'Unknown'));
        } finally { setExporting(null); }
    };

    const handleExportExam = async () => {
        if (!course) return;
        setExporting('exam');
        try {
            const { exportMasterExamPdf } = await import('@/lib/exporters/pdfExport');
            await exportMasterExamPdf(course);
            toast.success('Master exam PDF exported!');
        } catch (e) {
            toast.error('Export failed');
        } finally { setExporting(null); }
    };

    const handleExportPptx = async () => {
        if (!course) return;
        setExporting('pptx');
        try {
            const { exportPptx } = await import('@/lib/exporters/pptxExport');
            await exportPptx(course);
            toast.success('PowerPoint exported!');
        } catch (e) {
            toast.error('Export failed');
        } finally { setExporting(null); }
    };

    const handleExportZip = async () => {
        if (!course) return;
        setExporting('zip');
        try {
            const { exportHtmlZip } = await import('@/lib/exporters/htmlZipExport');
            await exportHtmlZip(course);
            toast.success('HTML course package downloaded!');
        } catch (e) {
            toast.error('Export failed');
        } finally { setExporting(null); }
    };

    if (!mounted || !course) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    const lesson = course.lessons[activeLesson];

    return (
        <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top bar */}
            <div style={{
                padding: '14px 28px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
                <Link href="/courses" className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
                    <ChevronLeft size={16} /> Back
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {course.title}
                    </h1>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {course.lessons.length} chapters · ~{course.totalEstimatedMinutes} min
                    </span>
                </div>

                {/* Export menu */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleExportZip} disabled={!!exporting} title="Download HTML ZIP (offline)">
                        {exporting === 'zip' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
                        Offline ZIP
                    </button>
                    {course.formats.includes('manual') && (
                        <button className="btn btn-secondary btn-sm" onClick={handleExportPdf} disabled={!!exporting} title="Export Manual PDF">
                            {exporting === 'pdf' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={14} />}
                            Manual PDF
                        </button>
                    )}
                    {course.formats.includes('quiz') && (
                        <button className="btn btn-secondary btn-sm" onClick={handleExportExam} disabled={!!exporting} title="Export Master Exam PDF">
                            {exporting === 'exam' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FileDown size={14} />}
                            Exam PDF
                        </button>
                    )}
                    {course.formats.includes('slideshow') && (
                        <button className="btn btn-secondary btn-sm" onClick={handleExportPptx} disabled={!!exporting} title="Export PPTX">
                            {exporting === 'pptx' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Presentation size={14} />}
                            PPTX
                        </button>
                    )}
                </div>

                {/* Link replacement -> Publish State Toggle */}
                {course.status !== 'published' ? (
                    <button className="btn btn-primary btn-sm" onClick={handlePublish}>
                        <Globe size={14} /> Mark as Published
                    </button>
                ) : (
                    <button className="btn btn-primary btn-sm" onClick={handleCopyShare}>
                        <Share2 size={14} /> Copy Share Link
                    </button>
                )}
                {!isEditing ? (
                    <>
                        <button className="btn btn-secondary btn-sm" onClick={handleStartEdit}>
                            <Edit3 size={14} /> Edit Chapter
                        </button>
                        <Link href={`/courses/${id}/learn`} className="btn btn-secondary btn-sm">
                            <Users size={14} /> Learner View
                        </Link>
                    </>
                ) : (
                    <>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowExpandModal(true)}>
                            <Sparkles size={14} /> AI Expand
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                            <X size={14} /> Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                            <Save size={14} /> Save Changes
                        </button>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Lesson sidebar */}
                <div style={{
                    width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
                    overflow: 'auto', flexShrink: 0, padding: '12px 8px',
                }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 8px 8px' }}>
                        Chapters
                    </p>
                    {course.lessons.map((lesson, idx) => (
                        <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(idx)}
                            style={{
                                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                                background: activeLesson === idx ? 'rgba(99,102,241,0.1)' : 'transparent',
                                border: activeLesson === idx ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                                color: activeLesson === idx ? 'var(--primary-dark)' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2,
                            }}
                        >
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2, opacity: 0.7 }}>
                                Ch. {lesson.order}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>{lesson.title}</div>
                            <div style={{ fontSize: '0.7rem', marginTop: 2, opacity: 0.6 }}>{lesson.estimatedMinutes} min</div>
                        </button>
                    ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {/* Format tabs */}
                    <div style={{
                        display: 'flex', gap: 2, padding: '8px 16px',
                        background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)',
                    }}>
                        {course.formats.map((fmt) => {
                            const Icon = FORMAT_ICONS[fmt] || BookOpen;
                            return (
                                <button
                                    key={fmt}
                                    onClick={() => setActiveTab(fmt)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                        background: activeTab === fmt ? 'rgba(99,102,241,0.15)' : 'transparent',
                                        color: activeTab === fmt ? 'var(--primary-dark)' : 'var(--text-muted)',
                                        fontWeight: activeTab === fmt ? 600 : 400, fontSize: '0.85rem',
                                        transition: 'all 0.15s',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    <Icon size={15} />
                                    {FORMAT_LABELS[fmt]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                        {!isEditing && lesson && activeTab === 'slideshow' && <SlideViewer key={lesson.id} lesson={lesson} brand={course.brandSnapshot} courseId={course.id} />}
                        {!isEditing && lesson && activeTab === 'manual' && <ManualViewer key={lesson.id} lesson={lesson} brand={course.brandSnapshot} />}
                        {!isEditing && lesson && activeTab === 'cards' && <CardViewer key={lesson.id} lesson={lesson} />}
                        {!isEditing && lesson && activeTab === 'script' && <ScriptViewer key={lesson.id} lesson={lesson} courseId={course.id} />}
                        {!isEditing && lesson && activeTab === 'quiz' && <QuizViewer key={lesson.id} lesson={lesson} courseId={course.id} />}
                        {!isEditing && lesson && activeTab === 'simulation' && <SimulationViewer key={lesson.id} lesson={lesson} brand={course.brandSnapshot} courseId={course.id} />}

                        {isEditing && editedLesson && activeTab === 'manual' && (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Edit Manual Markdown:</div>
                                <textarea
                                    value={editedLesson.manualContent}
                                    onChange={(e) => setEditedLesson({ ...editedLesson, manualContent: e.target.value })}
                                    style={{ flex: 1, padding: 16, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.9rem', resize: 'none' }}
                                />
                            </div>
                        )}
                        {isEditing && editedLesson && activeTab === 'slideshow' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Edit Slides:</div>
                                {editedLesson.slides.map((slide: any, i: number) => (
                                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 12 }}>Slide {i + 1}</div>
                                        <input
                                            value={slide.title}
                                            onChange={(e) => {
                                                const ns = [...editedLesson.slides];
                                                ns[i].title = e.target.value;
                                                setEditedLesson({ ...editedLesson, slides: ns });
                                            }}
                                            style={{ width: '100%', padding: '8px 12px', marginBottom: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                                            placeholder="Slide Title"
                                        />
                                        <textarea
                                            value={slide.content}
                                            onChange={(e) => {
                                                const ns = [...editedLesson.slides];
                                                ns[i].content = e.target.value;
                                                setEditedLesson({ ...editedLesson, slides: ns });
                                            }}
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minHeight: 100 }}
                                            placeholder="Main Concept Text"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {isEditing && editedLesson && !['manual', 'slideshow'].includes(activeTab) && (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                                Direct editing for {activeTab} is not yet supported. Use the AI Expand tool to completely rewrite this chapter.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Expand Modal */}
            {showExpandModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--bg-card)', padding: 32, borderRadius: 12,
                        width: 500, maxWidth: '90%', border: '1px solid var(--border)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                            AI Expand Chapter
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                            Provide instructions for how you want the AI to rewrite and expand this chapter. E.g. "Focus deeply on compliance laws", "Make this 3x longer", etc.
                        </p>

                        <textarea
                            value={expandInstructions}
                            onChange={(e) => setExpandInstructions(e.target.value)}
                            placeholder="Optional instructions..."
                            style={{
                                width: '100%', height: 120, padding: 12, borderRadius: 8,
                                border: '1px solid var(--border)', background: 'var(--bg)',
                                color: 'var(--text)', marginBottom: 20, resize: 'none'
                            }}
                            disabled={isExpanding}
                        />

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowExpandModal(false)} disabled={isExpanding}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleExpandAI} disabled={isExpanding}>
                                {isExpanding ? (
                                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Expanding...</>
                                ) : (
                                    <><Sparkles size={16} /> Expand Now</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
