'use client';

import { Loader2, Lock, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function PaywallModal() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(`Failed: ${data.details || data.error}`);
            window.location.href = data.url;
        } catch (err) {
            console.error(err);
            setLoading(false);
            alert('Failed to launch Stripe Checkout. Please ensure your environment variables are set.');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)', padding: '40px', borderRadius: '24px',
                width: '100%', maxWidth: '440px', border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)', textAlign: 'center'
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                }}>
                    <Lock size={32} />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '12px' }}>
                    SaaS Subscription Required
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
                    Your creator account is currently inactive. Please start a subscription to access the TrainDash.io Dashboard, manage AI courses, and generate share links.
                </p>

                <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', fontWeight: 700, fontSize: '1rem',
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        boxShadow: '0 8px 16px rgba(99,102,241,0.25)', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                    {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} /> : <><CreditCard size={20} /> Subscribe with Stripe</>}
                </button>
            </div>
        </div>
    );
}
