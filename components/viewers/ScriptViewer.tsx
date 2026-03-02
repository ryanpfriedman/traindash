'use client';
import { useState, useRef } from 'react';
import { Lesson } from '@/lib/types';
import { Clock, Eye, Volume2, Loader2 } from 'lucide-react';

export default function ScriptViewer({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
    const [playingScene, setPlayingScene] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const scenes = lesson.scriptScenes;
    if (!scenes || scenes.length === 0) return <div style={{ color: 'var(--text-muted)', padding: 20 }}>No script for this chapter.</div>;

    return (
        <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{lesson.title} — Video Script</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{scenes.length} scenes · Ready for recording</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {scenes.map((scene, idx) => {
                    const isPlaying = playingScene === scene.id;

                    const handlePlayAudio = async () => {
                        if (playingScene) return; // Wait for current to finish

                        setPlayingScene(scene.id);
                        try {
                            const response = await fetch('/api/tts/public', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ courseId, text: scene.narration }),
                            });

                            if (!response.ok) throw new Error('Failed to generate audio');

                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);

                            if (audioRef.current) {
                                audioRef.current.pause();
                            }

                            const audio = new Audio(url);
                            audioRef.current = audio;

                            audio.onended = () => setPlayingScene(null);
                            audio.onerror = () => setPlayingScene(null);

                            await audio.play();
                        } catch (err) {
                            console.error('Audio playback failed:', err);
                            setPlayingScene(null);
                        }
                    };

                    return (
                        <div key={scene.id} style={{
                            background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden',
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{
                                padding: '12px 20px', background: 'var(--bg-card2)',
                                borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <span style={{
                                    width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 700,
                                }}>{idx + 1}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text)', flex: 1 }}>{scene.sceneTitle}</span>
                                {scene.duration && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                                        <Clock size={12} />{scene.duration}
                                    </span>
                                )}
                            </div>
                            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            🎤 Narration
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handlePlayAudio}
                                            disabled={isPlaying || playingScene !== null}
                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                        >
                                            {isPlaying ? (
                                                <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Playing...</>
                                            ) : (
                                                <><Volume2 size={12} /> Play Narration</>
                                            )}
                                        </button>
                                    </div>
                                    <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.9rem' }}>{scene.narration}</p>
                                </div>
                                {scene.visualCue && (
                                    <div style={{
                                        padding: '10px 14px', borderRadius: 8,
                                        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
                                        display: 'flex', alignItems: 'flex-start', gap: 8,
                                    }}>
                                        <Eye size={14} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Visual</div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{scene.visualCue}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
