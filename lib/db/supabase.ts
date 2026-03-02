import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to determine if we are running with a valid Supabase connection
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'undefined' && supabaseKey !== 'undefined';
};
