import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, Target, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch from Supabase PostgreSQL (replaces better-sqlite3)
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Analytics Unavailable</h1>
                <p>You must be signed in to view creator analytics.</p>
                <Link href="/courses" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Courses</Link>
            </div>
        );
    }

    // Verify ownership of the course
    const { data: courseData } = await supabase.from('courses').select('id, title').eq('id', id).eq('user_id', user.id).single();
    if (!courseData) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <p>Course not found or unauthorized.</p>
                <Link href="/courses" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Courses</Link>
            </div>
        );
    }

    // 1. Get raw analytics dataset for this course
    const { data: rawAnalytics } = await supabase
        .from('analytics')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: false });

    const records = rawAnalytics || [];

    // 2. Aggregate metrics on the server
    const completions = records.filter(r => r.lesson_id === 'course_complete').length;

    // Unique learners based on learner_email
    const starterEmails = new Set(records.filter(r => r.lesson_id === 'course_start').map(r => r.learner_email));
    const uniqueStarters = starterEmails.size;

    // Quizzes (anything that has a total > 0)
    const quizzes = records.filter(r => r.total > 0);
    let avgScorePercent = 0;
    if (quizzes.length > 0) {
        const sumRatios = quizzes.reduce((sum, q) => sum + (q.score / q.total), 0);
        avgScorePercent = Math.round((sumRatios / quizzes.length) * 100);
    }

    const recentScores = quizzes.slice(0, 50).map(q => ({
        user_name: q.learner_email,
        score: q.score,
        total: q.total,
        passed: q.passed,
        timestamp: q.created_at
    }));

    const analytics = {
        totalCompletions: completions,
        uniqueStarters,
        averageScorePercent: avgScorePercent,
        recentScores
    };

    if (!analytics) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Analytics Unavailable</h1>
                <p>Could not load database records for this course.</p>
                <Link href="/courses" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Courses</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
            <div style={{ marginBottom: 32 }}>
                <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16, textDecoration: 'none', fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Course Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time performance metrics for your team</p>
            </div>

            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>

                <div className="glass" style={{ padding: 24, borderRadius: 16, borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-muted)' }}>
                        <Users size={20} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unique Learners</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
                        {analytics.uniqueStarters}
                    </div>
                </div>

                <div className="glass" style={{ padding: 24, borderRadius: 16, borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-muted)' }}>
                        <CheckCircle size={20} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completions</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
                        {analytics.totalCompletions}
                    </div>
                </div>

                <div className="glass" style={{ padding: 24, borderRadius: 16, borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-muted)' }}>
                        <Target size={20} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Quiz Score</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
                        {analytics.averageScorePercent}%
                    </div>
                </div>

                <div className="glass" style={{ padding: 24, borderRadius: 16, borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--text-muted)' }}>
                        <TrendingUp size={20} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completion Rate</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>
                        {analytics.uniqueStarters > 0 ? Math.round((analytics.totalCompletions / analytics.uniqueStarters) * 100) : 0}%
                    </div>
                </div>

            </div>

            {/* Recent Quiz Scores Table */}
            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Assessment Scores</h2>
                </div>

                {analytics.recentScores.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No quiz submissions recorded yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Learner</th>
                                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Score</th>
                                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                                    <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.recentScores.map((score, i) => {
                                    const pct = Math.round((score.score / score.total) * 100);
                                    return (
                                        <tr key={i} style={{ borderBottom: i === analytics.recentScores.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: 500 }}>{score.user_name}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 100, height: 6, background: 'var(--bg-card2)', borderRadius: 3 }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', background: score.passed ? '#10b981' : '#ef4444', borderRadius: 3 }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {score.passed ? (
                                                    <span style={{ display: 'inline-flex', padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Passed</span>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Failed</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {new Date(score.timestamp).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
