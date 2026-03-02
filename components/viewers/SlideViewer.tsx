'use client';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2, Loader2 } from 'lucide-react';
import { Lesson, BrandSettings } from '@/lib/types';

export default function SlideViewer({ lesson, brand, courseId }: { lesson: Lesson; brand: BrandSettings; courseId: string }) {
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const slides = lesson.slides;
    if (!slides || slides.length === 0) return <div style={{ color: 'var(--text-muted)', padding: 20 }}>No slides for this chapter.</div>;
    const slide = slides[current];

    const handlePlayAudio = async () => {
        if (!slide.speakerNotes || isPlaying) return;

        setIsPlaying(true);
        try {
            const response = await fetch('/api/tts/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, text: slide.speakerNotes }),
            });

            if (!response.ok) throw new Error('Failed to generate audio');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => setIsPlaying(false);

            await audio.play();
        } catch (err) {
            console.error('Audio playback failed:', err);
            setIsPlaying(false);
        }
    };

    return (
        <div>
            {/* Slide card */}
            <div style={{
                background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden',
                border: '1px solid var(--border)', minHeight: 420,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
                {/* Slide header */}
                <div style={{
                    background: `linear-gradient(135deg, ${brand.primaryColor || '#6366f1'}, ${brand.secondaryColor || '#8b5cf6'})`,
                    padding: '28px 36px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                {lesson.title} · Slide {current + 1} of {slides.length}
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>{slide.title}</h2>
                        </div>

                        {/* Audio controls */}
                        {slide.speakerNotes && (
                            <button
                                onClick={handlePlayAudio}
                                disabled={isPlaying}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: 30,
                                    padding: '8px 16px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    cursor: isPlaying ? 'default' : 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isPlaying ? (
                                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                                ) : (
                                    <><Volume2 size={16} /> Play Narration</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {slide.content && (
                        <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                            {slide.content}
                        </p>
                    )}

                    {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                            {slide.bulletPoints.map((bp, i) => (
                                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                                        background: brand.primaryColor || '#0078D4',
                                    }} />
                                    <span style={{ color: 'var(--text)', lineHeight: 1.6, fontSize: '0.95rem' }}>{bp}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Speaker notes */}
                {slide.speakerNotes && (
                    <div style={{
                        margin: '0 36px 28px', padding: '12px 16px', borderRadius: 4,
                        background: 'rgba(0,120,212,0.06)', border: '1px solid rgba(0,120,212,0.15)',
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>🎤 Speaker Notes</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{slide.speakerNotes}</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
                    <ChevronLeft size={16} /> Prev
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                    {slides.map((_, i) => (
                        <button key={i} onClick={() => setCurrent(i)} style={{
                            width: i === current ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                            background: i === current ? (brand.primaryColor || '#6366f1') : 'var(--border)',
                            transition: 'all 0.2s',
                        }} />
                    ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))} disabled={current === slides.length - 1}>
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
