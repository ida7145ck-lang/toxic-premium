import { NextResponse } from 'next/server';
import { publishToSocial } from '@/lib/social/providers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, content, mediaUrl, title } = body;

    if (!platform) {
      return NextResponse.json({ error: 'Missing platform field' }, { status: 400 });
    }

    console.log(`[Publish API] Posting to ${platform}:`, {
      contentLength: content?.length || 0,
      hasMedia: !!mediaUrl,
      title: title || 'N/A'
    });

    const result = await publishToSocial({ 
      platform, 
      content: content || '', 
      mediaUrl, 
      title 
    });

    console.log(`[Publish API] ${platform} result:`, result);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ ...result, error: result.error || 'Failed to publish' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Publish API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', success: false }, { status: 500 });
  }
}