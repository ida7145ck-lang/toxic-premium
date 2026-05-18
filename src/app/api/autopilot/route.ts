import { NextResponse } from 'next/server';
import { geminiGenerateText, geminiGenerateImage } from '@/lib/ai/gemini';
import { publishToSocial } from '@/lib/social/providers';
import { defaultAutopilotConfig } from '@/lib/social/autopilot';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const isManual = body.manual === true;
    const clientApiKey = body.apiKey;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const config = defaultAutopilotConfig; 
    
    const isScheduledTime = config.schedule.some(time => {
      const [h, m] = time.split(':');
      return parseInt(h) === now.getHours() && (now.getMinutes() >= 0 && now.getMinutes() <= 5);
    });

    if (!isScheduledTime && !isManual) {
      return NextResponse.json({ message: 'Not a scheduled time' }, { status: 200 });
    }

    console.log(`${isManual ? 'Manual' : 'Autopilot'} trigger at ${currentTime}`);

    // 1. Generate High-End Narrative
    const prompt = `Create a high-impact, premium social media post for the ${config.niche} niche. Focus on dominance, success, and dark luxury aesthetic. Suggest a specific trending audio style or track (e.g. "Phonk", "Deep House", "Interstellar theme style") that matches the intensity of the text. Return as JSON with "text" and "music" fields.`;
    const aiResponse = await geminiGenerateText(prompt);
    
    let content = "Success is not an option, it is an obligation. #ToxicPremium";
    let suggestedMusic = "Deep House / Phonk (Trending)";

    try {
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      content = parsed.text || content;
      suggestedMusic = parsed.music || suggestedMusic;
    } catch (e) {
      content = aiResponse || content;
    }

    // 2. Generate matching 8K Visual
    const imagePrompt = `Premium 3D render, luxury aesthetic, ${config.niche} theme, dominance and success, cinematic lighting, 8k. Context: ${content.substring(0, 100)}`;
    const imageRes = await geminiGenerateImage(imagePrompt);
    const mediaUrl = imageRes.url;

    // 3. Publish to all connected platforms
    const platforms: any[] = ['facebook', 'instagram', 'tiktok', 'youtube'];
    
    const results = await Promise.all(platforms.map(async (platform) => {
      // Ayrshare typically requires a video for YouTube/TikTok. 
      // We send the image URL and hope the platform/bridge handles it as a "community post" or converts it.
      const res = await publishToSocial({
        platform,
        content,
        suggestedMusic,
        mediaUrl
      }, clientApiKey);
      return { platform, ...res };
    }));

    const allSuccessful = results.every(r => r.success);
    const someSuccessful = results.some(r => r.success);

    return NextResponse.json({ 
      success: someSuccessful, // Success if at least one platform worked
      allSuccessful,
      trigger: isManual ? 'manual' : 'autopilot',
      time: currentTime,
      content,
      music: suggestedMusic,
      results 
    });

  } catch (error) {
    console.error('Autopilot error:', error);
    return NextResponse.json({ error: 'Failed to run autopilot' }, { status: 500 });
  }
}
