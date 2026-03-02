'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, BookOpen, Clock, CheckCircle, ChevronRight, Zap, TrendingUp, Users, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCourses, getSettings, getAllProgress, getProfile } from '@/lib/storage';
import { Course } from '@/lib/types';
import PaywallModal from '@/components/PaywallModal';

const FORMAT_LABELS: Record<string, string> = {
  slideshow: '📊 Slides',
  manual: '📄 Manual',
  cards: '🗂️ Cards',
  script: '🎥 Script',
  quiz: '📋 Quiz',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'badge-warning',
  published: 'badge-success',
  archived: 'badge-neutral',
};

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ subscriptionStatus: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const c = await getAllCourses();
      const s = await getSettings();
      const p = await getProfile();
      setCourses(c);
      setSettings(s);
      setProgress(getAllProgress());
      setProfile(p);
      setMounted(true);
    };
    load();
  }, []);
  const published = courses.filter((c) => c.status === 'published').length;
  const totalMinutes = courses.reduce((a, c) => a + (c.totalEstimatedMinutes || 0), 0);
  const completions = progress.filter((p) => p.overallPercent === 100).length;

  if (!mounted) return null;

  return (
    <>
      {profile && profile.subscriptionStatus !== 'active' && <PaywallModal />}
      <div className="animate-fade-in" style={{ padding: '40px', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{
                width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
                {settings?.brand?.companyName || 'TrainDash.io'}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Build and deploy training courses that empower your team.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>

            <Link href="/create" className="btn btn-primary btn-lg">
              <PlusCircle size={18} />
              New Course
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'var(--primary)' },
            { label: 'Published', value: published, icon: CheckCircle, color: 'var(--success)' },
            { label: 'Est. Training Hours', value: Math.round(totalMinutes / 60 * 10) / 10, icon: Clock, color: 'var(--accent)' },
            { label: 'Completions', value: completions, icon: TrendingUp, color: 'var(--warning)' },
          ].map((stat) => (
            <div key={stat.label} className="glass" style={{ padding: '20px 24px' }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${stat.color}18`,
                }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Courses */}
        {courses.length === 0 ? (
          <div
            className="glass"
            style={{ padding: '80px 40px', textAlign: 'center', border: '2px dashed var(--border)' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(99,102,241,0.1)', margin: '0 auto 20px',
            }}>
              <BookOpen size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              No courses yet
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
              Create your first AI-powered training course in minutes. Just enter a topic and let the research begin.
            </p>
            <Link href="/create" className="btn btn-primary">
              <PlusCircle size={16} />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>Your Courses</h2>
              <Link href="/courses" style={{ fontSize: '0.85rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {courses.slice(0, 6).map((course) => {
                const prog = progress.find((p) => p.courseId === course.id);
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="glass glass-hover"
                    style={{ padding: '20px', textDecoration: 'none', display: 'block' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`badge ${STATUS_STYLES[course.status]}`}>
                        {course.status}
                      </span>
                      <ChevronRight size={16} style={{ color: 'var(--text-subtle)', marginTop: 2 }} />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 6, lineHeight: 1.4 }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                      {course.description?.substring(0, 90)}{course.description?.length > 90 ? '...' : ''}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.formats.map((f) => (
                        <span key={f} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                          {FORMAT_LABELS[f]}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      <span>{course.lessons.length} chapters · ~{course.totalEstimatedMinutes} min</span>
                      {prog && <span style={{ color: 'var(--success)' }}>{prog.overallPercent}% complete</span>}
                    </div>
                    {prog && (
                      <div className="progress-bar" style={{ marginTop: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${prog.overallPercent}%` }} />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
