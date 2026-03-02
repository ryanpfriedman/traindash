'use client';
import { Lesson, BrandSettings } from '@/lib/types';

export default function ManualViewer({ lesson, brand }: { lesson: Lesson; brand: BrandSettings }) {
    if (!lesson.manualContent) return <div style={{ color: 'var(--text-muted)', padding: 20 }}>No manual content for this chapter.</div>;

    const renderMarkdown = (text: string) => {
        return text
            .replace(/^# (.+)$/gm, `<h1 style="font-size:1.6rem;font-weight:800;color:var(--text);margin:28px 0 12px;padding-bottom:10px;border-bottom:2px solid ${brand.primaryColor || '#6366f1'}">$1</h1>`)
            .replace(/^## (.+)$/gm, `<h2 style="font-size:1.25rem;font-weight:700;color:var(--text);margin:22px 0 10px;">$1</h2>`)
            .replace(/^### (.+)$/gm, `<h3 style="font-size:1.05rem;font-weight:700;color:var(--text-muted);margin:18px 0 8px;">$1</h3>`)
            .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text);font-weight:700">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em style="color:var(--text-muted)">$1</em>')
            .replace(/^- (.+)$/gm, `<li style="padding:6px 0 6px 16px;color:var(--text);line-height:1.6;position:relative;"><span style="position:absolute;left:0;top:12px;width:7px;height:7px;border-radius:50%;background:${brand.primaryColor || '#6366f1'};display:inline-block;"></span>$1</li>`)
            .replace(/(<li.*<\/li>\n?)+/g, '<ul style="list-style:none;padding:0;margin:12px 0">$&</ul>')
            .replace(/\n\n/g, '</p><p style="color:var(--text);line-height:1.8;margin-bottom:14px">')
            .replace(/^(?!<[hul])(.+)$/gm, '<p style="color:var(--text);line-height:1.8;margin-bottom:14px">$1</p>');
    };

    return (
        <div className="glass" style={{ padding: '36px 40px', maxWidth: 760 }}>
            <div
                style={{
                    padding: '10px 18px', borderRadius: 8, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: `${brand.primaryColor || '#6366f1'}18`, border: `1px solid ${brand.primaryColor || '#6366f1'}30`,
                }}
            >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: brand.primaryColor || '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Chapter {lesson.order}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· ~{lesson.estimatedMinutes} min read</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>{lesson.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.manualContent) }} />
        </div>
    );
}
