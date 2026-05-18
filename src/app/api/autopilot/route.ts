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

    // 1. Generate High-End Quote Narrative
    const prompt = `Create a viral "Dark Luxury" quote for the modern world. 
    Themes: Stoicism, Making Money, and dealing with Toxic Environments/People.
    Format: A powerful short quote followed by 3 brief bullet points of wisdom.
    Style: Aggressive, Stoic, Elite.
    Suggest a specific trending audio track (e.g. "Slowed Phonk", "Deep Techno", "Cinematic Dark").
    Return as JSON with "text" and "music" fields.`;
    
    const aiResponse = await geminiGenerateText(prompt);
    
    let content = "The loudest in the room is the weakest. Build in silence. #Stoicism #Wealth #ToxicFree";
    let suggestedMusic = "Slowed Phonk / Dark Cinematic";

    try {
      const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      content = parsed.text || content;
      suggestedMusic = parsed.music || suggestedMusic;
    } catch (e) {
      content = aiResponse || content;
    }

    // 2. Generate matching 8K Visual (Vertical Quote Card Style)
    const imagePrompt = `Vertical 9:16 mobile wallpaper, Dark Luxury aesthetic, minimalist Stoic background, high-end texture, cinematic lighting, 8k. Atmosphere: Wealth and Focus. No text in image.`;
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
