import { AppSettings, Course, LearnerProgress } from './types';
import { createClient } from '@/utils/supabase/client';

export const DEFAULT_SETTINGS: AppSettings = {
    api: { provider: 'openai', apiKey: '', model: 'gpt-4o' },
    brand: { companyName: 'TrainDash.io', logoUrl: null, primaryColor: '#6366f1', secondaryColor: '#8b5cf6', accentColor: '#06b6d4' },
    storage: { savePdfs: false },
    role: 'creator',
    orgShareToken: '',
};

// Settings
export async function saveSettings(settings: AppSettings): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('brand_settings').upsert({
        user_id: user.id,
        company_name: settings.brand.companyName,
        hr_email: settings.brand.hrEmail,
        primary_color: settings.brand.primaryColor,
        secondary_color: settings.brand.secondaryColor,
        accent_color: settings.brand.accentColor,
        api_provider: settings.api.provider,
        api_key: settings.api.apiKey,
        api_model: settings.api.model,
    });
}

export async function getSettings(): Promise<AppSettings> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_SETTINGS;

    const { data, error } = await supabase.from('brand_settings').select('*').eq('user_id', user.id).single();
    if (error || !data) return DEFAULT_SETTINGS;

    return {
        ...DEFAULT_SETTINGS,
        api: {
            provider: data.api_provider || 'openai',
            apiKey: data.api_key || '',
            model: data.api_model || 'gpt-4o',
        },
        brand: {
            ...DEFAULT_SETTINGS.brand,
            companyName: data.company_name || 'TrainDash.io',
            hrEmail: data.hr_email,
            primaryColor: data.primary_color || '#6366f1',
            secondaryColor: data.secondary_color || '#8b5cf6',
            accentColor: data.accent_color || '#06b6d4',
        }
    };
}

export async function getProfile(): Promise<{ subscriptionStatus: string } | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single();
    if (error || !data) return { subscriptionStatus: 'inactive' };

    return { subscriptionStatus: data.subscription_status };
}

export async function getOrgShareToken(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : null;
}

export async function getOrgSettings(orgToken: string): Promise<AppSettings> {
    const supabase = createClient();
    const { data, error } = await supabase.from('brand_settings').select('*').eq('user_id', orgToken).single();
    if (error || !data) return DEFAULT_SETTINGS;

    return {
        ...DEFAULT_SETTINGS,
        api: {
            provider: data.api_provider || 'openai',
            apiKey: data.api_key || '',
            model: data.api_model || 'gpt-4o',
        },
        brand: {
            ...DEFAULT_SETTINGS.brand,
            companyName: data.company_name || 'TrainDash.io',
            hrEmail: data.hr_email,
            primaryColor: data.primary_color || '#6366f1',
            secondaryColor: data.secondary_color || '#8b5cf6',
            accentColor: data.accent_color || '#06b6d4',
        }
    };
}

export async function getOrgCourses(orgToken: string): Promise<Course[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('courses').select('*').eq('user_id', orgToken).eq('status', 'published').order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        formats: item.formats,
        lessons: item.lessons || [],
        totalEstimatedMinutes: item.total_estimated_minutes,
        brandSnapshot: DEFAULT_SETTINGS.brand,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        topic: item.topic || '',
        researchMode: item.researchMode || 'research-only',
        outline: item.outline || [],
        uploadedPdfs: item.uploadedPdfs || [],
        researchReport: item.researchReport || '',
        shareToken: item.shareToken || item.id
    }));
}

// Courses
export async function saveCourse(course: Course): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('courses').upsert({
        id: course.id,
        user_id: user.id,
        title: course.title,
        description: course.description,
        status: course.status,
        formats: course.formats,
        lessons: course.lessons,
        updated_at: new Date().toISOString()
    });
}

export async function getCourse(id: string): Promise<Course | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error || !data) return null;

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as any,
        formats: data.formats,
        lessons: data.lessons || [],
        totalEstimatedMinutes: data.total_estimated_minutes,
        brandSnapshot: DEFAULT_SETTINGS.brand, // Replaced dynamically in viewers if needed
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        shareToken: data.id, // Use course ID as share token for simplicity in SaaS
        topic: '', // Defaulting Editor-state fields
        researchMode: 'pdf-only',
        outline: [],
        uploadedPdfs: [],
        researchReport: '',
    };
}

export async function getCourseByShareToken(token: string): Promise<Course | null> {
    const supabase = createClient();
    // Assuming token is actually just the course ID in SaaS land
    const { data, error } = await supabase.from('courses').select('*').eq('id', token).eq('status', 'published').single();
    if (error || !data) return null;

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as any,
        formats: data.formats,
        lessons: data.lessons || [],
        totalEstimatedMinutes: data.total_estimated_minutes,
        brandSnapshot: DEFAULT_SETTINGS.brand,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        shareToken: data.id,
        topic: '',
        researchMode: 'pdf-only',
        outline: [],
        uploadedPdfs: [],
        researchReport: '',
    };
}

export async function getAllCourses(): Promise<Course[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.from('courses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        status: d.status as any,
        formats: d.formats,
        lessons: d.lessons || [],
        totalEstimatedMinutes: d.total_estimated_minutes,
        brandSnapshot: DEFAULT_SETTINGS.brand,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        shareToken: d.id,
        topic: '',
        researchMode: 'pdf-only',
        outline: [],
        uploadedPdfs: [],
        researchReport: '',
    }));
}

export async function deleteCourse(id: string): Promise<void> {
    const supabase = createClient();
    await supabase.from('courses').delete().eq('id', id);
}

export async function updateCourseStatus(id: string, status: Course['status']): Promise<void> {
    const supabase = createClient();
    await supabase.from('courses').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
}

// Progress (Local storage makes sense for Learner Progress if they are anonymous, but let's keep it in local storage for now until we build Learner Auth, or let's use Supabase analytics for strict metrics)
export function saveProgress(progress: LearnerProgress): void {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem('traindash_progress');
        const all: LearnerProgress[] = raw ? JSON.parse(raw) : [];
        const idx = all.findIndex((p) => p.courseId === progress.courseId);
        if (idx >= 0) all[idx] = progress;
        else all.push(progress);
        localStorage.setItem('traindash_progress', JSON.stringify(all));
    } catch { }
}

export function getProgress(courseId: string): LearnerProgress | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('traindash_progress');
        const all: LearnerProgress[] = raw ? JSON.parse(raw) : [];
        return all.find((p) => p.courseId === courseId) ?? null;
    } catch {
        return null;
    }
}

export function getAllProgress(): LearnerProgress[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem('traindash_progress');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function initProgress(courseId: string): LearnerProgress {
    const existing = getProgress(courseId);
    if (existing) return existing;
    const fresh: LearnerProgress = {
        courseId,
        lessonProgress: {},
        startedAt: new Date().toISOString(),
        overallPercent: 0,
    };
    saveProgress(fresh);
    return fresh;
}

export function calculateOverallProgress(progress: LearnerProgress, totalLessons: number): number {
    if (totalLessons === 0) return 0;
    const completed = Object.values(progress.lessonProgress).filter(
        (lp) => lp.viewed && lp.quizCompleted
    ).length;
    return Math.round((completed / totalLessons) * 100);
}
