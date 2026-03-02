'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload, FileText, Globe, Layers, ChevronRight, ChevronLeft,
    Loader2, CheckCircle, X, Plus, Trash2, GripVertical,
    BookOpen, PresentationIcon, CreditCard, Video, ClipboardList, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { getSettings, saveCourse, getProfile } from '@/lib/storage';
import { runResearch, generateOutline, generateCourseContent, parsePdfClient } from '@/lib/ai';
import { Course, CourseFormat, CourseOutlineItem, ResearchMode, UploadedPdf, WizardState } from '@/lib/types';
import PaywallModal from '@/components/PaywallModal';

const STEPS = [
    { id: 1, label: 'Topic' },
    { id: 2, label: 'Research Mode' },
    { id: 3, label: 'Research' },
    { id: 4, label: 'Outline' },
    { id: 5, label: 'Formats' },
    { id: 6, label: 'Generate' },
    { id: 7, label: 'Preview' },
];

const FORMAT_OPTIONS: { id: CourseFormat; icon: string; label: string; desc: string }[] = [
    { id: 'slideshow', icon: '📊', label: 'Slideshow Presentation', desc: 'Chapter-based slides with speaker notes, rendered in browser and exportable to PPTX' },
    { id: 'manual', icon: '📄', label: 'Course Manual', desc: 'A structured, readable document — perfect as a training handbook or reference guide' },
    { id: 'cards', icon: '🗂️', label: 'Microlearning Cards', desc: 'Bite-sized flashcards for quick knowledge checks and mobile-friendly learning' },
    { id: 'script', icon: '🎥', label: 'Video Script', desc: 'Narrated scene-by-scene script with visual cues — ready for recording' },
    { id: 'quiz', icon: '📋', label: 'Quizzes & Assessment', desc: 'Chapter quizzes with instant feedback + printable master exam for all chapters' },
    { id: 'simulation', icon: '🎭', label: 'Interactive Roleplay', desc: 'A conversational AI simulation where learners practice real-world scenarios in a chat environment' },
];

const initialState: WizardState = {
    step: 1,
    topic: '',
    uploadedPdfs: [],
    researchMode: 'research-only',
    researchReport: '',
    outline: [],
    selectedFormats: ['slideshow', 'manual', 'quiz'],
    generatedCourse: null,
};

export default function CreateCoursePage() {
    const router = useRouter();
    const [state, setState] = useState<WizardState>(initialState);
    const [loading, setLoading] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [profile, setProfile] = useState<{ subscriptionStatus: string } | null>(null);

    useEffect(() => {
        getSettings().then(setSettings);
        getProfile().then(setProfile);
    }, []);

    const update = (patch: Partial<WizardState>) =>
        setState((prev) => ({ ...prev, ...patch }));

    // PDF upload handler
    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArr = Array.from(files).filter((f) => f.type === 'application/pdf');
        if (fileArr.length === 0) { toast.error('Please upload PDF files only.'); return; }
        toast.loading('Extracting PDF content...', { id: 'pdf-parse' });
        const newPdfs: UploadedPdf[] = [];
        for (const file of fileArr) {
            try {
                const content = await parsePdfClient(file);
                newPdfs.push({ id: uuidv4(), name: file.name, content });
            } catch {
                toast.error(`Failed to read ${file.name}`);
            }
        }
        update({ uploadedPdfs: [...state.uploadedPdfs, ...newPdfs] });
        toast.success(`${newPdfs.length} PDF(s) loaded`, { id: 'pdf-parse' });
        if (state.researchMode === 'research-only') {
            update({ researchMode: 'pdf-plus-research' });
        }
    }, [state.uploadedPdfs, state.researchMode]);

    // Step 3: Run research & auto-generate outline
    const runResearchStep = async () => {
        if (!settings?.api?.apiKey) {
            toast.error('Please add your API key in Settings first.'); return;
        }
        setLoading(true);
        setProgressText('Initializing research cycle...');
        try {
            update({ step: 3 }); // Move to progress screen
            const pdfContent = state.uploadedPdfs.map((p) => p.content).join('\n\n');
            let report = '';

            // 1. Run Research
            const { report: r } = await runResearch(
                settings.api, state.topic, state.researchMode, pdfContent,
                (chunk) => {
                    report += chunk;
                    setProgressText(`Researching... ${report.length} characters gathered`);
                }
            );

            // 2. Auto-generate Outline
            setProgressText('Research complete. Now generating course outline...');
            const { outline } = await generateOutline(settings.api, state.topic, r);

            update({ researchReport: r, outline, step: 4 });
            toast.success('Outline generated successfully!');
        } catch (err: unknown) {
            update({ step: 2 }); // Revert on failure
            toast.error(err instanceof Error ? err.message : 'Process failed');
        } finally {
            setLoading(false);
            setProgressText('');
        }
    };

    // Step 6: Generate course content
    const generateCourseStep = async () => {
        if (!settings?.api?.apiKey) { toast.error('Add API key in Settings'); return; }
        setLoading(true);
        try {
            const { lessons } = await generateCourseContent(
                settings.api,
                state.topic,
                state.outline,
                state.selectedFormats,
                state.researchReport,
                (lessonTitle, lessonIdx) => {
                    setProgressText(`Generating Chapter ${lessonIdx + 1}: "${lessonTitle}"...`);
                }
            );

            const totalMinutes = lessons.reduce((a, l) => a + l.estimatedMinutes, 0);
            const course: Course = {
                id: uuidv4(),
                title: state.topic,
                description: state.outline[0]?.description || `A comprehensive training course on ${state.topic}`,
                topic: state.topic,
                status: 'draft',
                formats: state.selectedFormats,
                researchMode: state.researchMode,
                lessons,
                outline: state.outline,
                uploadedPdfs: settings.storage.savePdfs ? state.uploadedPdfs : state.uploadedPdfs.map((p) => ({ ...p, content: '' })),
                researchReport: state.researchReport,
                brandSnapshot: settings.brand,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                totalEstimatedMinutes: totalMinutes,
                shareToken: uuidv4().replace(/-/g, '').substring(0, 12),
            };
            await saveCourse(course);
            update({ generatedCourse: course, step: 7 });
            toast.success('Course generated successfully!');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setLoading(false);
            setProgressText('');
        }
    };

    const toggleFormat = (f: CourseFormat) => {
        const curr = state.selectedFormats;
        if (curr.includes(f)) {
            if (curr.length === 1) { toast.error('Select at least one format'); return; }
            update({ selectedFormats: curr.filter((x) => x !== f) });
        } else {
            update({ selectedFormats: [...curr, f] });
        }
    };

    const removeOutlineItem = (id: string) =>
        update({ outline: state.outline.filter((o) => o.id !== id) });

    const addOutlineItem = () => {
        const newItem: CourseOutlineItem = {
            id: uuidv4(),
            title: 'New Chapter',
            description: 'Chapter description',
            keyTopics: ['Topic 1'],
            order: state.outline.length + 1,
        };
        update({ outline: [...state.outline, newItem] });
    };

    const updateOutlineItem = (id: string, patch: Partial<CourseOutlineItem>) => {
        update({
            outline: state.outline.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        });
    };

    const canProceed = () => {
        if (state.step === 1) return state.topic.trim().length >= 3 || state.uploadedPdfs.length > 0;
        if (state.step === 4) return state.outline.length > 0;
        if (state.step === 5) return state.selectedFormats.length > 0;
        return true;
    };

    const handleNext = () => {
        if (state.step === 2) { runResearchStep(); return; }
        // Step 3 is automated now, no button there
        if (state.step === 4) { update({ step: 5 }); return; }
        if (state.step === 5) { update({ step: 6 }); return; }
        if (state.step === 6) { generateCourseStep(); return; }
        if (state.step === 7 && state.generatedCourse) {
            router.push(`/courses/${state.generatedCourse.id}`); return;
        }
        update({ step: state.step + 1 });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '40px', minHeight: '100vh', maxWidth: 880, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 4 }}>
                    Create New Course
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    AI-powered course generation — from topic to full training program in minutes.
                </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center wizard-step-indicator mb-10">
                {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div className={`step-dot ${state.step > step.id ? 'completed' : state.step === step.id ? 'active' : ''}`}>
                                {state.step > step.id ? <CheckCircle size={14} /> : step.id}
                            </div>
                            <span style={{ fontSize: '0.6rem', color: state.step === step.id ? 'var(--primary-light)' : 'var(--text-subtle)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`step-line ${state.step > step.id ? 'completed' : ''}`} style={{ margin: '0 4px', marginBottom: 18 }} />}
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="glass" style={{ padding: '32px', minHeight: 400 }}>

                {/* STEP 1: Topic + PDF Upload */}
                {state.step === 1 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                            What should this course teach?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            Enter a topic for AI-powered research, or upload company PDFs for company-specific training courses.
                        </p>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'block' }}>
                                Course Topic
                            </label>
                            <input
                                className="input-field"
                                style={{ fontSize: '1rem', padding: '14px 16px' }}
                                placeholder="e.g. Workplace Safety, HIPAA Compliance, Customer Service Excellence..."
                                value={state.topic}
                                onChange={(e) => update({ topic: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            and / or upload company documents
                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        </div>

                        {/* Drop zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                            onClick={() => document.getElementById('pdf-input')?.click()}
                            style={{
                                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                                borderRadius: 12, padding: '32px', textAlign: 'center', cursor: 'pointer',
                                background: dragOver ? 'rgba(99,102,241,0.05)' : 'var(--bg-card2)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Upload size={28} style={{ color: 'var(--text-subtle)', margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
                                Drop PDFs here or click to browse
                            </p>
                            <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                                Upload as many PDFs as you need — policies, SOPs, handbooks, guides
                            </p>
                            <input id="pdf-input" type="file" accept=".pdf" multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                        </div>

                        {state.uploadedPdfs.length > 0 && (
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {state.uploadedPdfs.map((pdf) => (
                                    <div key={pdf.id} className="flex items-center justify-between" style={{
                                        padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 8,
                                        border: '1px solid var(--border)',
                                    }}>
                                        <div className="flex items-center gap-10">
                                            <FileText size={16} style={{ color: 'var(--primary-light)' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{pdf.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                                                {Math.round(pdf.content.length / 1000)}k chars
                                            </span>
                                        </div>
                                        <button className="btn btn-danger btn-sm btn-icon" onClick={() =>
                                            update({ uploadedPdfs: state.uploadedPdfs.filter((p) => p.id !== pdf.id) })
                                        }><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: Research Mode */}
                {state.step === 2 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                            How should the AI gather course content?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
                            Choose the research strategy for this course.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {([
                                { id: 'research-only', icon: Globe, label: 'Internet Research Only', desc: 'The AI conducts a deep dive on your topic using its broad knowledge base. Best for general enterprise topics.', disabled: false },
                                { id: 'pdf-only', icon: FileText, label: 'Uploaded PDFs Only', desc: 'Teach exclusively from your uploaded documents. Perfect for proprietary company policies or procedures.', disabled: state.uploadedPdfs.length === 0 },
                                { id: 'pdf-plus-research', icon: Layers, label: 'PDFs + Internet Research', desc: 'Use your uploaded documents as primary sources, supplemented by broader AI knowledge.', disabled: state.uploadedPdfs.length === 0 },
                            ] as const).map((mode) => (
                                <div
                                    key={mode.id}
                                    onClick={() => !mode.disabled && update({ researchMode: mode.id as ResearchMode })}
                                    style={{
                                        padding: '18px 20px', borderRadius: 10, cursor: mode.disabled ? 'not-allowed' : 'pointer',
                                        border: `2px solid ${state.researchMode === mode.id ? 'var(--primary)' : 'var(--border)'}`,
                                        background: state.researchMode === mode.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-card2)',
                                        opacity: mode.disabled ? 0.4 : 1,
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'flex-start', gap: 14,
                                    }}
                                >
                                    <mode.icon size={20} style={{ color: state.researchMode === mode.id ? 'var(--primary-light)' : 'var(--text-subtle)', marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{mode.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{mode.desc}</div>
                                        {mode.disabled && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: 4 }}>Upload PDFs in Step 1 to enable</div>}
                                    </div>
                                    {state.researchMode === mode.id && <CheckCircle size={18} style={{ color: 'var(--primary-light)', marginLeft: 'auto', flexShrink: 0 }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: Research in progress */}
                {state.step === 3 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        {loading ? (
                            <>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                    animation: 'glow 2s ease-in-out infinite',
                                }}>
                                    <Loader2 size={36} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                                    Running Research Cycle
                                </h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                    The AI is conducting a deep dive on <strong style={{ color: 'var(--primary-light)' }}>{state.topic}</strong>
                                </p>
                                <div style={{
                                    background: 'var(--bg-card2)', borderRadius: 8, padding: '12px 16px',
                                    fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto',
                                    fontFamily: 'monospace', textAlign: 'left', minHeight: 40,
                                }}>
                                    {progressText || 'Starting...'}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                }}>
                                    <CheckCircle size={36} style={{ color: 'var(--success)' }} />
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                                    Research Complete!
                                </h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                                    {state.researchReport.length.toLocaleString()} characters of research gathered. Ready to build the outline.
                                </p>
                            </>
                        )}
                    </div>
                )}

                {state.step === 4 && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                                    Review AI Course Outline
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    The AI has developed this outline based on research. You can edit or add chapters before continuing.
                                </p>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={addOutlineItem}>
                                <Plus size={14} /> Add Chapter
                            </button>
                        </div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                                <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>{progressText}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {state.outline.map((item, idx) => (
                                    <div key={item.id} style={{
                                        background: 'var(--bg-card2)', borderRadius: 10, padding: '14px 16px',
                                        border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start',
                                    }}>
                                        <GripVertical size={16} style={{ color: 'var(--text-subtle)', marginTop: 3, cursor: 'grab', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                                    Ch. {idx + 1}
                                                </span>
                                                <input
                                                    className="input-field"
                                                    style={{ fontWeight: 600, padding: '6px 10px', fontSize: '0.9rem' }}
                                                    value={item.title}
                                                    onChange={(e) => updateOutlineItem(item.id, { title: e.target.value })}
                                                />
                                            </div>
                                            <input
                                                className="input-field"
                                                style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}
                                                value={item.description}
                                                onChange={(e) => updateOutlineItem(item.id, { description: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            className="btn btn-danger btn-icon btn-sm"
                                            onClick={() => removeOutlineItem(item.id)}
                                        ><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 5: Format Selection */}
                {state.step === 5 && (
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                            Select Presentation Formats
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
                            Choose one or more formats — all selected formats will be generated simultaneously.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {FORMAT_OPTIONS.map((fmt) => {
                                const selected = state.selectedFormats.includes(fmt.id);
                                return (
                                    <div
                                        key={fmt.id}
                                        className="format-card"
                                        style={{
                                            border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                                            background: selected ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                                        }}
                                        onClick={() => toggleFormat(fmt.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            <span style={{ fontSize: '1.5rem' }}>{fmt.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{fmt.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{fmt.desc}</div>
                                            </div>
                                            {selected && <CheckCircle size={16} style={{ color: 'var(--primary-light)', marginLeft: 'auto', flexShrink: 0 }} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 6: Generating */}
                {state.step === 6 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        {loading ? (
                            <>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                    animation: 'glow 2s ease-in-out infinite',
                                }}>
                                    <Zap size={36} style={{ color: 'var(--primary)' }} />
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                                    Generating Your Course
                                </h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                                    Creating {state.selectedFormats.length} format(s) for {state.outline.length} chapters...
                                </p>
                                <div style={{
                                    background: 'var(--bg-card2)', borderRadius: 8, padding: '14px 20px', maxWidth: 480, margin: '0 auto',
                                    fontSize: '0.85rem', color: 'var(--primary-light)', fontFamily: 'monospace',
                                }}>
                                    ⚡ {progressText || 'Starting generation...'}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 16 }}>
                                    This may take a few minutes for longer courses. Please don't close this tab.
                                </p>
                            </>
                        ) : (
                            <div style={{ padding: 20 }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                                    Ready to generate?
                                </h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                                    <strong style={{ color: 'var(--text)' }}>{state.outline.length} chapters</strong> ·{' '}
                                    <strong style={{ color: 'var(--text)' }}>{state.selectedFormats.length} formats</strong>
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Click "Generate Course" below to start. This will call the AI for each chapter.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 7: Done */}
                {state.step === 7 && state.generatedCourse && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                        }}>
                            <CheckCircle size={36} style={{ color: 'var(--success)' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                            🎉 Course Created!
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                            <strong style={{ color: 'var(--text)' }}>{state.generatedCourse.title}</strong> is ready with{' '}
                            {state.generatedCourse.lessons.length} chapters and {state.generatedCourse.formats.length} format(s).
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <div style={{ padding: '12px 20px', background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                                    {state.generatedCourse.lessons.length}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chapters</div>
                            </div>
                            <div style={{ padding: '12px 20px', background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                                    {state.generatedCourse.totalEstimatedMinutes}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minutes</div>
                            </div>
                            <div style={{ padding: '12px 20px', background: 'var(--bg-card2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                                    {state.generatedCourse.formats.length}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formats</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6">
                <button
                    className="btn btn-secondary"
                    onClick={() => update({ step: Math.max(1, state.step - 1) })}
                    disabled={state.step === 1 || loading}
                >
                    <ChevronLeft size={16} /> Back
                </button>

                <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                >
                    {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    {state.step === 2 ? 'Start AI Generation' :
                        state.step === 3 ? 'Processing...' :
                            state.step === 4 ? 'Confirm & Continue' :
                                state.step === 5 ? 'Continue' :
                                    state.step === 6 ? (loading ? 'Generating...' : 'Generate Course Content') :
                                        state.step === 7 ? 'Open Course →' :
                                            'Continue'}
                    {!loading && state.step !== 7 && <ChevronRight size={16} />}
                </button>
            </div>
        </div>
    );
}
