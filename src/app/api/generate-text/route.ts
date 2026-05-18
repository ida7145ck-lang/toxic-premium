import { NextResponse } from 'next/server';
import { geminiGenerateText, textGenerationTemplate } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[API] Incoming request body:', JSON.stringify(body));
    
    let { prompt, niche, platform, subTheme } = body;

    if (!prompt && niche && platform) {
      prompt = textGenerationTemplate(niche, platform, subTheme || 'Success');
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt or niche data' }, { status: 400 });
    }

    const text = await geminiGenerateText(prompt);
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('[API Error]:', error.message);
    return NextResponse.json({ result: "Success is the only option. (AI currently in maintenance, try again in 30s)" }, { status: 200 });
  }
}
