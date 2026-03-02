import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { courseId, text, voice = 'alloy' } = await req.json();

        if (!courseId || !text) {
            return NextResponse.json({ error: 'Missing courseId or text' }, { status: 400 });
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

        if (apiSettings.provider !== 'openai') {
            return NextResponse.json({ error: 'TTS is currently only supported with OpenAI keys.' }, { status: 400 });
        }

        const client = new OpenAI({ apiKey: apiSettings.apiKey });

        const mp3 = await client.audio.speech.create({
            model: 'tts-1',
            voice: voice as any,
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        return new NextResponse(buffer, {
            headers: { 'Content-Type': 'audio/mpeg' },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Public TTS proxy error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
