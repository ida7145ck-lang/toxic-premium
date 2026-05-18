import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'dummy-key') return null;
  return new GoogleGenerativeAI(apiKey.trim());
}

export async function geminiGenerateText(prompt: string, systemInstruction?: string) {
  const genAI = getGenAI();
  
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (error: any) {
      console.error('[Gemini] Primary AI failed, switching to fallback:', error.message);
    }
  }

  // SILENT FALLBACK: If Gemini fails OR if there is no key
  return fallbackGenerateText(prompt);
}

async function fallbackGenerateText(prompt: string) {
  try {
    const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt + " (Keep it short and premium)")}`);
    const text = await response.text();
    return text || "The elite don't wait for APIs. (Backup AI failed - check connection)";
  } catch (e) {
    return "The elite don't wait for APIs. They create their own path.";
  }
}

export async function geminiGenerateImage(prompt: string) {
  const seed = Math.floor(Math.random() * 1000000);
  return { url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}` };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a viral ${niche} social media hook and caption for ${platform}. Topic: ${subTheme}. Tone: Dark Luxury, Stoic, Aggressive. 3 bullet points, 3 hashtags.`;
};
