import { ApiSettings, CourseOutlineItem, Lesson, ResearchMode, UploadedPdf } from './types';

interface ResearchResult {
    report: string;
}

interface OutlineResult {
    outline: CourseOutlineItem[];
}

interface CourseContentResult {
    lessons: Lesson[];
}

export async function callOpenAI(
    apiSettings: ApiSettings,
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    onChunk?: (chunk: string) => void
): Promise<string> {
    const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiSettings, messages }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `API error: ${response.status}`);
    }

    if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            fullText += chunk;
            onChunk(chunk);
        }
        return fullText;
    }

    const data = await response.json();
    return data.content;
}

export async function runResearch(
    apiSettings: ApiSettings,
    topic: string,
    researchMode: ResearchMode,
    pdfContent: string,
    onProgress?: (text: string) => void
): Promise<ResearchResult> {
    const systemPrompt = `You are an expert instructional designer and researcher. Your job is to conduct a comprehensive research and analysis on a given topic to prepare it for course creation. 
  
  Produce a detailed, structured research report covering:
  - Core concepts and fundamentals
  - Key principles and best practices
  - Real-world applications and examples
  - Common challenges and how to overcome them
  - Advanced topics and future trends
  - Recommended learning progression
  
  Format your response as a well-structured markdown document with clear sections.`;

    let userMessage = '';

    if (researchMode === 'pdf-only' && pdfContent) {
        userMessage = `Based EXCLUSIVELY on the following document content, produce a comprehensive research report for a training course. Do NOT add any information from outside these documents.\n\nDOCUMENT CONTENT:\n${pdfContent}\n\nTopic/Focus: ${topic || 'As described in the documents above'}`;
    } else if (researchMode === 'pdf-plus-research' && pdfContent) {
        userMessage = `Produce a comprehensive research report for a training course on: "${topic}"\n\nUse the following uploaded documents as primary source material, and supplement with your broader knowledge:\n\nDOCUMENT CONTENT:\n${pdfContent}`;
    } else {
        userMessage = `Produce a comprehensive research report for a training course on: "${topic}"\n\nCover all important aspects thoroughly. This will be used to create professional enterprise training content.`;
    }

    const report = await callOpenAI(apiSettings, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ], onProgress);

    return { report };
}

export async function generateOutline(
    apiSettings: ApiSettings,
    topic: string,
    researchReport: string,
    onProgress?: (text: string) => void
): Promise<OutlineResult> {
    const systemPrompt = `You are an expert instructional designer. Based on a research report, create a structured course outline. Return ONLY valid JSON matching this exact structure:
  
  {
    "outline": [
      {
        "id": "lesson-1",
        "title": "Chapter Title",
        "description": "Brief description of what this chapter covers",
        "keyTopics": ["topic1", "topic2", "topic3"],
        "order": 1
      }
    ]
  }
  
  Create 5-8 logical chapters that progress from foundational to advanced. Each chapter should have 3-5 key topics.`;

    const userMessage = `Topic: ${topic}\n\nResearch Report:\n${researchReport.substring(0, 8000)}\n\nGenerate a comprehensive course outline as JSON.`;

    const raw = await callOpenAI(apiSettings, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ], onProgress);

    try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        return JSON.parse(jsonMatch[0]);
    } catch {
        throw new Error('Failed to parse outline JSON from AI response');
    }
}

export async function generateCourseContent(
    apiSettings: ApiSettings,
    topic: string,
    outline: CourseOutlineItem[],
    formats: string[],
    researchReport: string,
    onProgress?: (lessonTitle: string, lessonIndex: number) => void
): Promise<CourseContentResult> {
    const lessons: Lesson[] = [];

    for (let i = 0; i < outline.length; i++) {
        const chapter = outline[i];
        onProgress?.(chapter.title, i);

        const systemPrompt = `You are an expert instructional designer creating high-end, in-depth enterprise training content. Generate comprehensive content for one lesson chapter. Return ONLY valid JSON.
    
    The JSON must match this structure exactly:
    {
      "slides": [
        {
          "id": "s1",
          "title": "Slide Title",
          "content": "A detailed, elaborate paragraph explaining the core concepts of this slide thoroughly. Do not use simple bullet points; instead, write enterprise-grade instructional prose that deeply examines the topic.",
          "bulletPoints": ["Detailed supporting metric, chart data, or crucial takeaway 1", "Detailed supporting metric, chart data, or crucial takeaway 2"],
          "speakerNotes": "Extensive speaker notes (at least 3-4 sentences) that provide additional context, real-world examples, and guidance for the presenter.",
          "imagePrompt": "Suggest a chart, graph, or enterprise diagram (e.g., 'A bar chart showing year-over-year compliance growth')"
        }
      ],
      "manualContent": "Full markdown text for this chapter...",
      "cards": [{"id":"c1","front":"Question or term","back":"Answer or definition","category":""}],
      "scriptScenes": [{"id":"sc1","sceneTitle":"","narration":"","visualCue":"","duration":""}],
      "quiz": [{"id":"q1","question":"","options":["A","B","C","D"],"correctIndex":0,"explanation":""}],
      "aiRoleplay": {
        "persona": "Description of the AI's role (e.g. 'You are an angry customer demanding a refund.')",
        "objective": "The learner's conversational goal (e.g. 'Successfully de-escalate the situation and offer a partial refund.')",
        "openingMessage": "The AI's first message to start the chat."
      },
      "estimatedMinutes": 15
    }
    
    Requirements:
    - slides: 8-15 slides covering the chapter thoroughly. EVERY slide MUST have detailed, dense 'content' paragraphs (at least 3 sentences) expanding on the topic. Provide actual training material that matches a lengthy training time. Use 'bulletPoints' for chart data, statistics, or complex lists, not as a replacement for the main content.
    - manualContent: 800-1500 words of well-structured markdown
    - cards: 8-12 flashcards covering key terms and concepts
    - scriptScenes: 4-6 scenes for a video presentation
    - quiz: 5 multiple choice questions with 4 options each
    - aiRoleplay: A challenging, realistic scenario for the learner to practice the chapter's concepts through chat.
    - All content must be exhaustive, highly detailed, accurate, and appropriate for corporate enterprise training`;

        const userMessage = `Course Topic: ${topic}
Chapter ${i + 1}: ${chapter.title}
Description: ${chapter.description}
Key Topics to Cover: ${chapter.keyTopics.join(', ')}

Research Context:
${researchReport.substring(0, 3000)}

Generate complete lesson content as JSON.`;

        try {
            const raw = await callOpenAI(apiSettings, [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ]);

            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON');
            const parsed = JSON.parse(jsonMatch[0]);

            lessons.push({
                id: chapter.id,
                title: chapter.title,
                description: chapter.description,
                order: chapter.order,
                slides: parsed.slides || [],
                manualContent: parsed.manualContent || '',
                cards: parsed.cards || [],
                scriptScenes: parsed.scriptScenes || [],
                quiz: parsed.quiz || [],
                aiRoleplay: parsed.aiRoleplay,
                estimatedMinutes: parsed.estimatedMinutes || 15,
            });
        } catch (err) {
            console.error(`Failed to generate lesson ${i + 1}:`, err);
            lessons.push({
                id: chapter.id,
                title: chapter.title,
                description: chapter.description,
                order: chapter.order,
                slides: [],
                manualContent: `# ${chapter.title}\n\n${chapter.description}`,
                cards: [],
                scriptScenes: [],
                quiz: [],
                estimatedMinutes: 15,
            });
        }
    }

    return { lessons };
}

export async function parsePdfClient(file: File): Promise<string> {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = `\n=== FILE: ${file.name} ===\n`;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: unknown) => (item as { str?: string }).str || '')
            .join(' ');
        text += pageText + '\n';
    }

    return text;
}

export async function expandChapterContent(
    apiSettings: ApiSettings,
    courseTopic: string,
    lesson: Lesson,
    instructions: string,
    onProgress?: (msg: string) => void
): Promise<Partial<Lesson>> {
    const systemPrompt = `You are an expert instructional designer improving existing enterprise training content.
The user wants to EXPAND and REGENERATE a specific chapter. 
They have provided specific instructions for what to add, change, or focus on.

Return ONLY valid JSON matching this structure:
{
  "slides": [
    {
      "id": "s1",
      "title": "Slide Title",
      "content": "A detailed, elaborate paragraph...",
      "bulletPoints": ["Metric 1", "Metric 2"],
      "speakerNotes": "Extensive speaker notes...",
      "imagePrompt": "A bar chart..."
    }
  ],
  "manualContent": "Full markdown text for this chapter...",
  "cards": [{"id":"c1","front":"Question or term","back":"Answer or definition","category":""}],
  "scriptScenes": [{"id":"sc1","sceneTitle":"","narration":"","visualCue":"","duration":""}],
  "quiz": [{"id":"q1","question":"","options":["A","B","C","D"],"correctIndex":0,"explanation":""}],
  "aiRoleplay": {
    "persona": "Brief role description",
    "objective": "Learner's goal",
    "openingMessage": "First AI chat message to kick off"
  },
  "estimatedMinutes": 20
}

CRITICAL INSTRUCTIONS:
- Review the current chapter content provided by the user.
- Apply the user's specific instructions to profoundly expand, enhance, or rewrite it.
- Ensure the 'slides' array has highly detailed 'content' paragraphs.
- Ensure 'manualContent' is extensive and formatting is clean.
- Ensure the output strictly follows the JSON schema.`;

    const userMessage = `Course Topic: ${courseTopic}
Chapter Name: ${lesson.title}

USER INSTRUCTIONS FOR EXPANSION:
${instructions}

CURRENT CHAPTER CONTENT TO IMPROVE:
Slides: ${JSON.stringify(lesson.slides.map(s => ({ title: s.title, content: s.content })))}
Manual Content Preview: ${lesson.manualContent.substring(0, 1000)}...

Generate the enhanced complete lesson content as JSON.`;

    onProgress?.('AI is profoundly expanding your chapter content...');

    try {
        const raw = await callOpenAI(apiSettings, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ], onProgress);

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error('Expansion failed:', err);
        throw new Error('Failed to expand chapter content.');
    }
}

export async function generateAudio(apiSettings: ApiSettings, text: string): Promise<string> {
    if (apiSettings.provider !== 'openai') {
        throw new Error('Voiceover generation is currently only supported with OpenAI.');
    }

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiSettings.apiKey}`,
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'alloy',
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Audio generation failed: ${errText}`);
    }

    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
