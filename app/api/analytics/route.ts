import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );

        const body = await req.json();
        const { type, data } = body;

        let insertPayload: any = {};

        if (type === 'activity') {
            insertPayload = {
                course_id: data.courseId,
                lesson_id: data.eventType, // Map 'course_start' or 'course_complete' to lesson_id
                learner_email: data.userName || 'Anonymous',
            };
        } else if (type === 'quiz') {
            insertPayload = {
                course_id: data.courseId,
                lesson_id: data.lessonId,
                learner_email: data.userName || 'Anonymous',
                score: data.score,
                total: data.total,
                passed: data.passed,
            };
        } else {
            return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from('analytics').insert([insertPayload]);

        if (error) {
            console.error('Supabase Analytics Error:', error.message);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error('Analytics API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
