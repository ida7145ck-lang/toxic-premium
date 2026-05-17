import { NextResponse } from 'next/server';
import { getGeminiModel, textGenerationTemplate } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { niche, platform, subTheme } = await request.json();

    if (!niche || !platform || !subTheme) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = textGenerationTemplate(niche, platform, subTheme);

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Error generating text:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
