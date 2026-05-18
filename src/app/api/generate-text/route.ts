import { NextResponse } from 'next/server';
import { geminiGenerateText } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const { prompt, systemInstruction } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('[API] Requesting text generation...');
    const text = await geminiGenerateText(prompt, systemInstruction);
    
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('[API Error] Text generation failed:', error.message);
    
    // If the error is specific to the API Key, let's make it very clear in the response
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
