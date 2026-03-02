'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, ArrowRight } from 'lucide-react'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/courses')
            router.refresh()
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/confirm`,
            },
        })

        if (error) {
            setError(error.message)
        } else {
            setError('Check your email for the confirmation link.')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {error}
                </div>
            )}

            <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Email</label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@company.com"
                    required
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s',
                        fontFamily: 'Inter, sans-serif'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
            </div>

            <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Password</label>
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s',
                        fontFamily: 'Inter, sans-serif'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px',
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem'
                    }}
                    onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--bg-card2)' }}
                    onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'transparent' }}
                >
                    Sign Up
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px',
                        border: 'none', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                        fontFamily: 'Inter, sans-serif', fontSize: '0.9rem'
                    }}
                >
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <>Sign In <ArrowRight size={16} /></>}
                </button>
            </div>
        </form>
    )
}
