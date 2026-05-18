import { NextResponse } from 'next/server';
import { geminiGenerateText } from '@/lib/ai/gemini';
import { publishToSocial } from '@/lib/social/providers';
import { defaultAutopilotConfig } from '@/lib/social/autopilot';

export async function POST(req: Request) {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // In a real app, we'd fetch settings from a database
    const config = defaultAutopilotConfig; 
    
    // Check if current time is in schedule (exact minute match or within a window)
    const isScheduledTime = config.schedule.some(time => {
      const [h, m] = time.split(':');
      return parseInt(h) === now.getHours() && (now.getMinutes() >= 0 && now.getMinutes() <= 5);
    });

    if (!isScheduledTime) {
      return NextResponse.json({ message: 'Not a scheduled time' }, { status: 200 });
    }

    console.log(`Autopilot triggered at ${currentTime}`);

    // 1. Generate content using AI
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

    // 2. Publish to all connected platforms
    const platforms: any[] = ['facebook', 'instagram', 'tiktok', 'youtube'];
    
    const results = await Promise.all(platforms.map(async (platform) => {
      return await publishToSocial({
        platform,
        content,
        suggestedMusic,
      });
    }));

    return NextResponse.json({ 
      success: true, 
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
