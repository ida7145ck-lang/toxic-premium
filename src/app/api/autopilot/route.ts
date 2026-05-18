import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/gemini';
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
    const prompt = `Create a high-impact, premium social media post for the ${config.niche} niche. Focus on dominance, success, and dark luxury aesthetic.`;
    const aiResponse = await generateText({ prompt });
    const content = aiResponse || "Success is not an option, it is an obligation. #ToxicPremium";

    // 2. Publish to all connected platforms
    // For now, we simulate getting connected platforms (real app would use a DB)
    const platforms: any[] = ['facebook', 'instagram', 'tiktok', 'youtube'];
    
    const results = await Promise.all(platforms.map(async (platform) => {
      return await publishToSocial({
        platform,
        content,
        // In real autopilot, we'd also generate an image
      });
    }));

    return NextResponse.json({ 
      success: true, 
      time: currentTime,
      content,
      results 
    });

  } catch (error) {
    console.error('Autopilot error:', error);
    return NextResponse.json({ error: 'Failed to run autopilot' }, { status: 500 });
  }
}
