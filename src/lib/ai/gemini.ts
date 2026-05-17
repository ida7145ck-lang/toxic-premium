import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Robustly retrieves the GoogleGenerativeAI client.
 */
function getGenAI() {
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'dummy-key') {
    console.error('[Gemini] ERROR: GEMINI_API_KEY is missing or empty in environment variables.');
    // We must throw or return a placeholder that will fail with a better error
    return new GoogleGenerativeAI('invalid-dummy-key');
  }

  apiKey = apiKey.trim();
  
  // Safe Debugging: Show first 3 and last 3 chars to help user verify
  const start = apiKey.substring(0, 3);
  const end = apiKey.substring(apiKey.length - 3);
  console.log(`[Gemini] Client initialized. Key starts with "${start}", ends with "${end}", total length: ${apiKey.length}`);

  if (apiKey.startsWith('ghp_')) {
    console.error('[Gemini] WARNING: Your API key starts with "ghp_", which looks like a GitHub token. Please use a Gemini API key from Google AI Studio.');
  } else if (!apiKey.startsWith('AIza')) {
    console.warn('[Gemini] WARNING: Your API key does not start with "AIza", which is unusual for Google API keys.');
  }

  return new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  return getGenAI().getGenerativeModel({ model: modelName });
}

export const geminiModel = {
  generateContent: (prompt: any) => getGeminiModel().generateContent(prompt)
};

export async function geminiGenerateText(prompt: string, systemInstruction?: string) {
  console.log('[Gemini] Requesting text generation...');
  try {
    const model = getGenAI().getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('[Gemini] API CALL FAILED:', error.message);
    if (error.errorDetails) {
      console.error('[Gemini] Detailed Error:', JSON.stringify(error.errorDetails));
    }
    throw error;
  }
}

export async function geminiGenerateImage(prompt: string) {
  console.log('[Gemini] Image request (Pollinations Fallback):', prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
  return { url: imageUrl };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a ${niche} social media hook and caption for ${platform}. Theme: ${subTheme}. Tone: Premium, authoritative, and minimalist. Include 3 bullet points of actionable advice and 3 trending hashtags.`;
};
