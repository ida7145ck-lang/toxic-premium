import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'dummy-key') {
    console.error('[Gemini] ERROR: GEMINI_API_KEY is missing in Vercel Environment Variables.');
    return new GoogleGenerativeAI('missing-key');
  }

  apiKey = apiKey.trim();
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  
  let status = "VALID FORMAT";
  if (apiKey.startsWith('ghp_')) status = "INVALID: This is a GitHub token, not a Gemini key!";
  if (apiKey.startsWith('sk-')) status = "INVALID: This is an OpenAI key, not a Gemini key!";
  if (!apiKey.startsWith('AIza')) status = "WARNING: Key doesn't start with 'AIza' (Google standard)";

  console.log(`[Gemini] SECURITY CHECK: Key starts with "${start}", ends with "${end}", length: ${apiKey.length}. STATUS: ${status}`);

  return new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  return getGenAI().getGenerativeModel({ model: modelName });
}

export const geminiModel = {
  generateContent: (prompt: any) => getGeminiModel().generateContent(prompt)
};

export async function geminiGenerateText(prompt: string, systemInstruction?: string) {
  try {
    const model = getGenAI().getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('[Gemini] API ERROR:', error.message);
    throw error;
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
