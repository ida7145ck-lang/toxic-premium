import { NextResponse } from 'next/server';
import { geminiGenerateImage } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const { prompt, niche } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const stylePrefix = 'High-end 3D render, cinematic lighting, depth of field, 8k resolution, octane render, luxury aesthetic, dark background, minimalist composition. ';
    const fullPrompt = `${stylePrefix} ${prompt}`;

    const response = await geminiGenerateImage(fullPrompt);

    if (!response.url) {
      throw new Error('No image data returned from Gemini API');
    }

    return NextResponse.json({ imageUrl: response.url });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
