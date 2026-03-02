import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // extending Vercel/Netlify lambda timeout for long AI generations

export async function POST(req: NextRequest) {
    try {
        const { apiSettings, messages } = await req.json();

        if (!apiSettings?.apiKey) {
            return NextResponse.json(
                { error: 'No API key configured. Please add your API key in Settings.' },
                { status: 400 }
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
        console.error('AI API Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
