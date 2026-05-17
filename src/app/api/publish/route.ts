import { NextResponse } from 'next/server';
import { publishToSocial } from '@/lib/social/providers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, content, mediaUrl, title } = body;

    if (!platform || (!content && !mediaUrl)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await publishToSocial({ platform, content, mediaUrl, title });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
