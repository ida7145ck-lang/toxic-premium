import { NextResponse } from 'next/server';
import { openai } from '@/lib/ai/openai';

export async function POST(request: Request) {
  try {
    const { prompt, niche } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const stylePrefix = 'High-end 3D render, cinematic lighting, depth of field, 8k resolution, octane render, luxury aesthetic, dark background, minimalist composition. ';
    const fullPrompt = `${stylePrefix} ${prompt}`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
    });

    return NextResponse.json({ imageUrl: response.data[0].url });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
