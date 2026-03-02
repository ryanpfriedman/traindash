'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Lesson } from '@/lib/types';
import { saveProgress, getProgress, initProgress, calculateOverallProgress, getSettings } from '@/lib/storage';
import { getCourse } from '@/lib/storage';

export default function QuizViewer({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [hrEmail, setHrEmail] = useState<string | null>(null);
    const [courseTitle, setCourseTitle] = useState('');
    const quiz = lesson.quiz;

    useEffect(() => {
        const load = async () => {
            setAnswers({});
            setSubmitted(false);
            const s = await getSettings();
            setHrEmail(s?.brand?.hrEmail || null);
            const c = await getCourse(courseId);
            setCourseTitle(c?.title || '');
        };
        load();
    }, [lesson.id, courseId]);

    if (!quiz || quiz.length === 0) return <div style={{ color: 'var(--text-muted)', padding: 20 }}>No quiz for this chapter.</div>;

    const score = quiz.filter((q, _) => answers[q.id] === q.correctIndex).length;
    const pct = Math.round((score / quiz.length) * 100);

    const handleSubmit = async () => {
        setSubmitted(true);
        // Save progress
        const course = await getCourse(courseId);
        if (course) {
            const progress = initProgress(courseId);
            progress.lessonProgress[lesson.id] = {
                lessonId: lesson.id,
                viewed: true,
                quizCompleted: true,
                quizScore: score,
                quizTotal: quiz.length,
                completedAt: new Date().toISOString(),
            };
            progress.overallPercent = calculateOverallProgress(progress, course.lessons.length);
            if (progress.overallPercent === 100) progress.completedAt = new Date().toISOString();
            saveProgress(progress);
        }

        // Analytics webhook
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'quiz',
                data: {
                    courseId,
                    lessonId: lesson.id,
                    score,
                    total: quiz.length,
                    passed: Math.round((score / quiz.length) * 100) >= 70
                }
            })
        }).catch(console.error);
    };

    const letters = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Chapter Quiz</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{quiz.length} questions · Answer all to submit</p>
            </div>

            {submitted && (
                <div style={{
                    borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'center',
                    background: pct >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${pct >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                        {pct}%
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                        {pct >= 70 ? '🎉 Passed!' : '📚 Keep Studying'} — {score} / {quiz.length} correct
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {pct >= 70 ? 'Great work! Move on to the next chapter.' : 'Review the material and try again.'}
                    </div>
                    {hrEmail && pct >= 70 && (
                        <form action={`https://formsubmit.co/${hrEmail}`} method="POST" target="_blank" style={{ marginTop: 12 }}>
                            <input type="hidden" name="_subject" value={`Quiz Passed! ${courseTitle}`} />
                            <input type="hidden" name="Course" value={courseTitle} />
                            <input type="hidden" name="Chapter" value={lesson.title} />
                            <input type="hidden" name="Score" value={`${pct}% (${score}/${quiz.length})`} />
                            <input type="hidden" name="_captcha" value="false" />
                            <input type="hidden" name="_template" value="table" />
                            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                                ✉️ Email Results to HR
                            </button>
                        </form>
                    )}
                    {!submitted || (
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: hrEmail && pct >= 70 ? 0 : 12 }}
                            onClick={() => { setAnswers({}); setSubmitted(false); }}>
                            Retake Quiz
                        </button>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {quiz.map((q, qIdx) => {
                    const selected = answers[q.id];
                    const isAnswered = selected !== undefined;
                    return (
                        <div key={q.id} className="glass" style={{ padding: '20px 24px' }}>
                            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 14, lineHeight: 1.5 }}>
                                <span style={{ color: 'var(--primary-light)', marginRight: 6 }}>{qIdx + 1}.</span>
                                {q.question}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {q.options.map((opt, i) => {
                                    const isSelected = selected === i;
                                    const isCorrect = i === q.correctIndex;
                                    let bg = 'var(--bg-card2)';
                                    let border = 'var(--border)';
                                    let color = 'var(--text)';
                                    if (submitted) {
                                        if (isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#6ee7b7'; }
                                        else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; color = '#fca5a5'; }
                                    } else if (isSelected) {
                                        bg = 'rgba(99,102,241,0.1)'; border = 'var(--primary)'; color = 'var(--primary-light)';
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => !submitted && setAnswers({ ...answers, [q.id]: i })}
                                            disabled={submitted}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                                                background: bg, border: `1px solid ${border}`, borderRadius: 8,
                                                cursor: submitted ? 'default' : 'pointer', textAlign: 'left',
                                                color, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <span style={{
                                                width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isSelected || (submitted && isCorrect) ? border : 'var(--border)',
                                                color: isSelected || (submitted && isCorrect) ? 'white' : 'var(--text-subtle)',
                                                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, transition: 'all 0.15s',
                                            }}>
                                                {letters[i]}
                                            </span>
                                            {opt.replace(/^[A-E][.):\s]+/, '').trim()}
                                            {submitted && isCorrect && <CheckCircle size={16} style={{ marginLeft: 'auto', color: '#10b981', flexShrink: 0 }} />}
                                            {submitted && isSelected && !isCorrect && <XCircle size={16} style={{ marginLeft: 'auto', color: '#ef4444', flexShrink: 0 }} />}
                                        </button>
                                    );
                                })}
                            </div>
                            {submitted && q.explanation && (
                                <div style={{
                                    marginTop: 12, padding: '10px 14px', borderRadius: 8,
                                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                                    fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6,
                                }}>
                                    💡 {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!submitted && (
                <button
                    className="btn btn-primary"
                    style={{ marginTop: 20, width: '100%' }}
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < quiz.length}
                >
                    Submit Quiz ({Object.keys(answers).length}/{quiz.length} answered)
                </button>
            )}
        </div>
    );
}
