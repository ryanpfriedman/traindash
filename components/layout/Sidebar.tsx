'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    BookOpen, PlusCircle, Settings, LayoutDashboard,
    Zap, ChevronLeft, ChevronRight, GraduationCap, LogOut
} from 'lucide-react';
import { getSettings } from '@/lib/storage';
import { AppSettings } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/create', icon: PlusCircle, label: 'Create Course' },
    { href: '/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    useEffect(() => {
        setSettings(getSettings());
    }, []);

    const isLearner = settings?.role === 'learner';

    // Hide sidebar in learn mode
    if (pathname.includes('/learn')) return null;

    return (
        <aside
            className="transition-all duration-300 flex flex-col"
            style={{
                width: collapsed ? '68px' : '220px',
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                minHeight: '100vh',
                position: 'sticky',
                top: 0,
                flexShrink: 0,
                zIndex: 50,
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)', minHeight: 68 }}
            >
                <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                        width: collapsed ? 36 : 48,
                        height: collapsed ? 36 : 48,
                        transition: 'all 0.3s'
                    }}
                >
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {!collapsed && (
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.3px' }}>
                            {settings?.brand?.companyName || 'TrainDash.io'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isLearner ? 'Learner Mode' : 'Creator Mode'}
                        </div>
                    </div>
                )}
            </div>

            {/* Role badge */}
            {!collapsed && (
                <div className="px-3 pt-4 pb-2">
                    <div
                        className="badge"
                        style={{
                            background: isLearner ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                            color: isLearner ? '#6ee7b7' : 'var(--primary-light)',
                            border: `1px solid ${isLearner ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
                            fontSize: '0.65rem',
                        }}
                    >
                        {isLearner ? <GraduationCap size={10} /> : <Zap size={10} />}
                        {isLearner ? 'Learner' : 'Creator'}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
                {navItems
                    .filter((item) => !isLearner || item.href === '/courses')
                    .map((item) => {
                        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} className="nav-link" data-active={active ? 'true' : 'false'}
                                style={{
                                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                }}
                            >
                                <item.icon size={18} style={{ flexShrink: 0 }} />
                                {!collapsed && <span style={{ fontWeight: active ? 600 : 500 }}>{item.label}</span>}
                            </Link>
                        );
                    })}

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="nav-link"
                    style={{
                        color: 'var(--text-muted)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        marginTop: 'auto', // Pushes it to the bottom of the nav flex container
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ fontWeight: 500 }}>Sign Out</span>}
                </button>
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="btn btn-ghost btn-icon"
                style={{
                    margin: '8px auto 16px',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                }}
                title={collapsed ? 'Expand' : 'Collapse'}
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </aside>
    );
}
