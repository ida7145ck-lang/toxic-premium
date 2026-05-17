import { NextResponse } from 'next/server';
import { openai, textGenerationTemplate } from '@/lib/ai/openai';

export async function POST(request: Request) {
  try {
    const { niche, platform, subTheme } = await request.json();

    if (!niche || !platform || !subTheme) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = textGenerationTemplate(niche, platform, subTheme);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a premium content strategist for a high-end personal brand focused on money, motivation, stoicism, and toxic environments.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: any) {
    console.error('Error generating text:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
