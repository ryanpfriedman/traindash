import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const { courseId, messages } = await req.json();

        if (!courseId || !messages) {
            return NextResponse.json({ error: 'Missing courseId or messages' }, { status: 400 });
        }

        const supabase = await createClient();

        // Use the secure RPC function to bypass RLS and fetch Creator API Keys
        const { data: apiSettings, error: rpcError } = await supabase.rpc('get_creator_api_settings', { p_course_id: courseId });

        if (rpcError || !apiSettings || !apiSettings.apiKey) {
            console.error('RPC Error fetching keys:', rpcError);
            return NextResponse.json(
                { error: 'Creator has not configured a valid API key for this course.' },
                { status: 403 }
            );
        }

        const client = new OpenAI({ apiKey: apiSettings.apiKey });

        const response = await client.chat.completions.create({
            model: apiSettings.model || 'gpt-4o',
            messages,
            temperature: 0.7,
            max_tokens: 4096,
            stream: false,
        });

        const content = response.choices[0]?.message?.content || '';
        return NextResponse.json({ content });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Public AI proxy error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
