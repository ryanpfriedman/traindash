import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: { message?: string, error?: string }
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        return redirect('/courses')
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                background: 'var(--bg-card)',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        color: 'white', fontWeight: 800, fontSize: '1.5rem', boxShadow: '0 8px 16px rgba(99,102,241,0.3)'
                    }}>T</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>TrainDash.io</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to manage your training courses.</p>
                </div>

                {searchParams?.message && (
                    <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
                        {searchParams.message}
                    </div>
                )}
                {searchParams?.error && (
                    <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
                        {searchParams.error}
                    </div>
                )}

                <LoginForm />
            </div>
        </div>
    )
}
