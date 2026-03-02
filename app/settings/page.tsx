'use client';

import { useEffect, useState } from 'react';
import { Save, Eye, EyeOff, TestTube, Upload, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSettings, saveSettings } from '@/lib/storage';
import { AppSettings, AppRole } from '@/lib/types';

const MODELS = ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        getSettings().then(s => {
            setSettings(s);
            setMounted(true);
        });
    }, []);

    if (!mounted || !settings) return null;

    const update = (patch: Partial<AppSettings>) => setSettings((s) => s ? { ...s, ...patch } : s);
    const updateApi = (patch: Partial<AppSettings['api']>) =>
        setSettings((s) => s ? { ...s, api: { ...s.api, ...patch } } : s);
    const updateBrand = (patch: Partial<AppSettings['brand']>) =>
        setSettings((s) => s ? { ...s, brand: { ...s.brand, ...patch } } : s);

    const handleSave = async () => {
        if (settings) {
            await saveSettings(settings);
            toast.success('Settings saved!');
        }
    };

    const handleTestApi = async () => {
        if (!settings.api.apiKey) { toast.error('Enter an API key first'); return; }
        setTesting(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiSettings: settings.api,
                    messages: [{ role: 'user', content: 'Say "API connection successful!" and nothing else.' }],
                }),
            });
            const data = await res.json();
            if (data.content) toast.success('✅ API connected: ' + data.content);
            else toast.error('API Error: ' + (data.error || 'Unknown'));
        } catch {
            toast.error('Connection failed');
        } finally { setTesting(false); }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => updateBrand({ logoUrl: ev.target?.result as string });
        reader.readAsDataURL(file);
    };

    return (
        <div className="animate-fade-in" style={{ padding: '40px', minHeight: '100vh', maxWidth: 720 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 4 }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure your API, branding, and preferences</p>
            </div>

            {/* API Section */}
            <section className="glass" style={{ padding: '28px', marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>🔑 AI API Configuration</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    Your API key is stored locally and never sent anywhere except directly to the AI provider.
                </p>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>API Provider</label>
                    <select
                        className="input-field"
                        value={settings.api.provider}
                        onChange={(e) => updateApi({ provider: e.target.value as AppSettings['api']['provider'] })}
                    >
                        <option value="openai">OpenAI (Default)</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google Gemini</option>
                    </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>API Key</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                className="input-field"
                                type={showKey ? 'text' : 'password'}
                                placeholder="sk-..."
                                value={settings.api.apiKey}
                                onChange={(e) => updateApi({ apiKey: e.target.value })}
                                style={{ paddingRight: 40 }}
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button className="btn btn-secondary" onClick={handleTestApi} disabled={testing} style={{ whiteSpace: 'nowrap' }}>
                            {testing ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <TestTube size={16} />}
                            Test
                        </button>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>AI Model</label>
                    <select className="input-field" value={settings.api.model} onChange={(e) => updateApi({ model: e.target.value })}>
                        {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 6 }}>GPT-4o recommended for best course quality.</p>
                </div>
            </section>

            {/* Branding */}
            <section className="glass" style={{ padding: '28px', marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 4 }}>🎨 Company Branding</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>Applied to all generated courses and exports.</p>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Company Name</label>
                    <input
                        className="input-field"
                        value={settings.brand.companyName}
                        onChange={(e) => updateBrand({ companyName: e.target.value })}
                        placeholder="Your Company Name"
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Company Logo</label>
                    {settings.brand.logoUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={settings.brand.logoUrl} alt="Logo" style={{ height: 48, maxWidth: 200, objectFit: 'contain', borderRadius: 8 }} />
                            <button className="btn btn-danger btn-sm" onClick={() => updateBrand({ logoUrl: null })}>
                                <X size={14} /> Remove
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => document.getElementById('logo-input')?.click()}
                            style={{
                                border: '2px dashed var(--border)', borderRadius: 8, padding: '20px', textAlign: 'center',
                                cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem',
                            }}
                        >
                            <Upload size={20} style={{ margin: '0 auto 8px' }} />
                            Click to upload logo (PNG, JPG, SVG)
                            <input id="logo-input" type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>HR Reporting Email (Optional)</label>
                    <input
                        className="input-field"
                        type="email"
                        value={settings.brand.hrEmail || ''}
                        onChange={(e) => updateBrand({ hrEmail: e.target.value })}
                        placeholder="hr@company.com"
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 6 }}>If configured, quizzes will prompt learners to automatically submit their score to this address via FormSubmit.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                        { label: 'Primary Color', key: 'primaryColor' as const },
                        { label: 'Secondary Color', key: 'secondaryColor' as const },
                        { label: 'Accent Color', key: 'accentColor' as const },
                    ].map((item) => (
                        <div key={item.key}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                                {item.label}
                            </label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                    type="color"
                                    value={settings.brand[item.key] || '#6366f1'}
                                    onChange={(e) => updateBrand({ [item.key]: e.target.value })}
                                    style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }}
                                />
                                <input
                                    className="input-field"
                                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}
                                    value={settings.brand[item.key] || '#6366f1'}
                                    onChange={(e) => updateBrand({ [item.key]: e.target.value })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Role & Storage */}
            <section className="glass" style={{ padding: '28px', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 20 }}>⚙️ Preferences</h2>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>Application Role</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {(['creator', 'learner'] as AppRole[]).map((role) => (
                            <button
                                key={role}
                                onClick={() => update({ role })}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 10, border: `2px solid ${settings.role === role ? 'var(--primary)' : 'var(--border)'}`,
                                    background: settings.role === role ? 'rgba(99,102,241,0.1)' : 'var(--bg-card2)',
                                    color: settings.role === role ? 'var(--primary-light)' : 'var(--text-muted)',
                                    fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                {role === 'creator' ? <Zap size={16} /> : <span>🎓</span>}
                                {role.charAt(0).toUpperCase() + role.slice(1)} Mode
                            </button>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 8 }}>
                        Creator mode shows all authoring tools. Learner mode shows a simplified view for employees.
                    </p>
                </div>

                <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 10 }}>PDF Storage</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            onClick={() => update({ storage: { ...settings.storage, savePdfs: !settings.storage.savePdfs } })}
                            style={{
                                width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer',
                                background: settings.storage.savePdfs ? 'var(--primary)' : 'var(--border)',
                                border: 'none', transition: 'all 0.2s',
                            }}
                        >
                            <span style={{
                                position: 'absolute', top: 2, left: settings.storage.savePdfs ? 22 : 2,
                                width: 20, height: 20, borderRadius: 10, background: 'white', transition: 'left 0.2s',
                            }} />
                        </button>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                            {settings.storage.savePdfs ? 'Save uploaded PDFs in storage' : 'Discard PDFs after processing'}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 6 }}>
                        Disable to ensure sensitive company documents are not retained after course generation.
                    </p>
                </div>
            </section>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleSave}>
                <Save size={18} /> Save All Settings
            </button>
        </div>
    );
}
