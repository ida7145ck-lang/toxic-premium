import { NextResponse } from 'next/server';
import { geminiGenerateText, textGenerationTemplate } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { prompt, systemInstruction, niche, platform, subTheme } = body;

    // Handle legacy format from frontend
    if (!prompt && niche && platform) {
      prompt = textGenerationTemplate(niche, platform, subTheme || 'General wisdom');
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('[API] Requesting text generation...');
    const text = await geminiGenerateText(prompt, systemInstruction);
    
    // Return 'result' to match frontend expectations
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('[API Error] Text generation failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('400')) {
      return NextResponse.json({ 
        error: 'The Google Gemini API Key is invalid. Please check your Vercel Environment Variables.',
        details: error.message,
        debug: 'Ensure your key is from aistudio.google.com and that the project has the Generative Language API enabled.'
      }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to generate text', details: error.message }, { status: 500 });
  }
}
