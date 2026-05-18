import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'dummy-key') {
    return null;
  }

  apiKey = apiKey.trim();
  return new GoogleGenerativeAI(apiKey);
}

export async function geminiGenerateText(prompt: string, systemInstruction?: string) {
  const genAI = getGenAI();
  
  if (!genAI) {
    console.warn('[Gemini] No API Key found, using fallback text generation.');
    return fallbackGenerateText(prompt);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('[Gemini] API ERROR:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
       console.log('[Gemini] Key invalid, switching to fallback.');
       return fallbackGenerateText(prompt);
    }
    throw error;
  }
}

async function fallbackGenerateText(prompt: string) {
  // Using a public text generation endpoint as an emergency fallback
  try {
    const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt + " (Keep it short and premium)")}`);
    return await response.text();
  } catch (e) {
    return "The elite don't wait for APIs. They create their own path. (Gemini is currently offline - please check your API key)";
  }
}

export async function geminiGenerateImage(prompt: string) {
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
  return { url: imageUrl };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a ${niche} social media hook and caption for ${platform}. Theme: ${subTheme}. Tone: Premium, authoritative, and minimalist. Include 3 bullet points of actionable advice and 3 trending hashtags.`;
};
