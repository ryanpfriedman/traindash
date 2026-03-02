'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Target } from 'lucide-react';
import { Lesson, BrandSettings } from '@/lib/types';
import { callOpenAI } from '@/lib/ai';
import { getSettings } from '@/lib/storage';

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    coaching?: string;
}

export default function SimulationViewer({ lesson, brand, courseId }: { lesson: Lesson; brand: BrandSettings; courseId: string }) {
    const roleplay = lesson.aiRoleplay;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize the chat with the opening message
    useEffect(() => {
        if (roleplay && messages.length === 0) {
            setMessages([
                { role: 'assistant', content: roleplay.openingMessage || 'Hello. Let us begin the roleplay scenario.' }
            ]);
        }
    }, [roleplay]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!roleplay) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No AI roleplay simulation data found for this chapter.
            </div>
        );
    }

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMsg = input.trim();
        setInput('');

        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: userMsg }
        ];

        setMessages(newMessages);
        setIsGenerating(true);

        try {
            // Build the system instructions specifically for this turn
            const systemPrompt = `You are participating in an interactive roleplay training simulation.
YOUR PERSONA: ${roleplay.persona}
THE LEARNER'S OBJECTIVE: ${roleplay.objective}

INSTRUCTIONS:
1. Stay perfectly in character at all times. NEVER break character.
2. Respond naturally to the user's messages as your persona would.
3. If the user successfully achieves their objective through effective communication, end your final message with the exact string "[PASSED]".
4. Before issuing your persona's response, provide a brief 1-2 sentence coaching tip for the user evaluating their LAST message. Format your entire output EXACTLY as follows:

[COACHING]
Your coaching feedback here.
[/COACHING]
[RESPONSE]
Your persona's conversational response here.
[/RESPONSE]`;

            const fullContext: Message[] = [
                { role: 'system', content: systemPrompt },
                ...newMessages
            ];

            const response = await fetch('/api/ai/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, messages: fullContext }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'AI Simulation connection failed' }));
                throw new Error(err.error || 'Connection failed');
            }
            const data = await response.json();
            const rawResponse = data.content;

            const coachingMatch = rawResponse.match(/\[COACHING\]([\s\S]*?)\[\/COACHING\]/i);
            const responseMatch = rawResponse.match(/\[RESPONSE\]([\s\S]*?)\[\/RESPONSE\]/i);

            const coachingStr = coachingMatch ? coachingMatch[1].trim() : '';
            let responseStr = responseMatch ? responseMatch[1].trim() : rawResponse.replace(/\[COACHING\][\s\S]*?\[\/COACHING\]/i, '').trim();

            setMessages(prev => [...prev, { role: 'assistant', content: responseStr, coaching: coachingStr }]);

        } catch (err: any) {
            console.error('Simulation Chat Error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600, background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>

            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${brand.primaryColor || '#6366f1'}, ${brand.secondaryColor || '#8b5cf6'})`, padding: '24px', color: 'white' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Target size={24} /> AI Roleplay Simulation
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem', opacity: 0.9 }}>
                    <div><strong>Persona:</strong> {roleplay.persona}</div>
                    <div><strong>Your Objective:</strong> {roleplay.objective}</div>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {messages.map((m, i) => {
                    const isUser = m.role === 'user';
                    const hasPassed = m.content.includes('[PASSED]');
                    const cleanContent = m.content.replace('[PASSED]', '').trim();

                    return (
                        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            {!isUser && (
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bot size={20} style={{ color: 'var(--primary)' }} />
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                                {/* Coaching Tip */}
                                {m.coaching && !isUser && (
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#b45309',
                                        padding: '10px 14px', borderRadius: 12, fontSize: '0.85rem', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start'
                                    }}>
                                        <span style={{ fontSize: '1rem' }}>💡</span>
                                        <div style={{ lineHeight: 1.5 }}>
                                            <strong style={{ display: 'block', marginBottom: 2 }}>Coach's Note</strong>
                                            {m.coaching}
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    background: isUser ? (brand.primaryColor || '#6366f1') : 'var(--bg-card2)',
                                    color: isUser ? 'white' : 'var(--text)',
                                    padding: '12px 16px', borderRadius: 16,
                                    borderBottomRightRadius: isUser ? 4 : 16,
                                    borderBottomLeftRadius: isUser ? 16 : 4,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    border: isUser ? 'none' : '1px solid var(--border)',
                                    lineHeight: 1.5, fontSize: '0.95rem'
                                }}>
                                    {cleanContent}
                                    {isGenerating && i === messages.length - 1 && isUser && (
                                        <span className="typing-indicator" style={{ display: 'inline-block', marginLeft: 8, opacity: 0.5 }}>...</span>
                                    )}
                                </div>
                                {hasPassed && (
                                    <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, marginTop: 4 }}>
                                        🎯 Objective Completed!
                                    </div>
                                )}
                            </div>

                            {isUser && (
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(156,163,175,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <User size={20} style={{ color: 'var(--text-muted)' }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your response..."
                        className="input-field"
                        style={{ flex: 1, padding: '14px 20px', borderRadius: 24 }}
                        disabled={isGenerating}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ borderRadius: 24, padding: '0 24px', gap: 8 }}
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                    >
                        Send <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
