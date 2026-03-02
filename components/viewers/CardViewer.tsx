'use client';
import { useState } from 'react';
import { Lesson } from '@/lib/types';

export default function CardViewer({ lesson }: { lesson: Lesson }) {
    const [flipped, setFlipped] = useState<Set<string>>(new Set());
    const cards = lesson.cards;
    if (!cards || cards.length === 0) return <div style={{ color: 'var(--text-muted)', padding: 20 }}>No flashcards for this chapter.</div>;

    const toggle = (id: string) => {
        const next = new Set(flipped);
        next.has(id) ? next.delete(id) : next.add(id);
        setFlipped(next);
    };

    return (
        <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                {cards.length} cards · Click any card to reveal the answer
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {cards.map((card) => {
                    const isFlipped = flipped.has(card.id);
                    return (
                        <div
                            key={card.id}
                            onClick={() => toggle(card.id)}
                            style={{ perspective: '800px', height: 160, cursor: 'pointer' }}
                        >
                            <div style={{
                                position: 'relative', width: '100%', height: '100%',
                                transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                            }}>
                                {/* Front */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    padding: '16px', textAlign: 'center',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                }}>
                                    {card.category && (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                                            {card.category}
                                        </span>
                                    )}
                                    <p style={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, fontSize: '0.9rem' }}>{card.front}</p>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginTop: 12 }}>Tap to reveal</span>
                                </div>
                                {/* Back */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '16px', textAlign: 'center', transform: 'rotateY(180deg)',
                                }}>
                                    <p style={{ color: 'white', lineHeight: 1.5, fontSize: '0.85rem' }}>{card.back}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
