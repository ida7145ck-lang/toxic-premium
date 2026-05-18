import { geminiGenerateText } from '../src/lib/ai/gemini';
import { publishToSocial } from '../src/lib/social/providers';

async function postNow() {
  console.log("🚀 Manual Force Post Started...");
  
  const prompt = `Create a high-impact, premium social media post for a Motivation niche. Focus on dominance, success, and dark luxury aesthetic. Suggest a specific trending audio style or track (e.g. "Phonk", "Deep House", "Interstellar theme style") that matches the intensity of the text. Return as JSON with "text" and "music" fields.`;
  
  try {
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

    console.log("📝 Generated Content:", content);
    console.log("🎵 Selected Music:", suggestedMusic);

    const platforms = ['facebook', 'instagram', 'tiktok', 'youtube'];
    
    for (const platform of platforms) {
      console.log(`📤 Publishing to ${platform}...`);
      const result = await publishToSocial({
        platform: platform as any,
        content,
        suggestedMusic,
      });
      console.log(`✅ Result for ${platform}:`, result.success ? "Success" : "Failed");
    }

    console.log("✨ All platforms processed.");
  } catch (error) {
    console.error("❌ Critical error during manual post:", error);
  }
}

postNow();
