import OpenAI from 'openai';

export const maxDuration = 60; // Allow enough time for LLM response
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Ensure we have an API key, we use the user's provided or system key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: "OpenAI API Key not configured." }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        const systemPrompt = `You are the official Customer Support AI for TrainDash.io, a premium B2B SaaS platform that automates corporate training. 
Your tone is professional, helpful, concise, and persuasive. 
Your goal is to answer visitor questions and encourage them to subscribe or explore the platform.

Here is the core information you know about TrainDash:
- Pricing: $49/mo for the "Creator Pro" Professional Subscription. 
- Features: Unlimited AI Course Generations, Unlimited Learner Links, Interactive Chat Simulations, Automated Quizzing & Analytics, Custom Branding.
- Value Prop: Upload a PDF SOP/Manual, and the AI generates a multi-modal course (Slides, TTS, Quizzes) in 3 minutes instead of 3 weeks.
- Distribution: Learners DO NOT need accounts to take a course. Creators just share a link.
- Chat Simulations: Learners can roleplay text-based scenarios with the AI (e.g. dealing with an angry customer).
- Affiliates: We have an affiliate program that pays 50% recurring commissions (link in footer).
- OpenAI Key Required: TrainDash is a Bring-Your-Own-Key (BYOK) platform. Users MUST provide their own OpenAI API Key in their Dashboard Settings to power the course generation and AI features.
- No Voice Calls: We only offer text-based chat simulations, not voice calls.
- No Free Trial: It's strictly $49/mo right now. 

Answer the user's question concisely based on this information. Be friendly. Limit answers to 2-3 short paragraphs maximum.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        const reply = response.choices[0]?.message?.content || "I'm sorry, I'm having trouble processing that request right now.";

        return Response.json({ reply });

    } catch (error: any) {
        console.error("Support Chatbot Error:", error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
