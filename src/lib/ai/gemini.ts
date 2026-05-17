import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[Gemini] GEMINI_API_KEY is NOT defined in environment variables.');
  } else {
    // Only log that it's present, don't log the key
    console.log('[Gemini] GEMINI_API_KEY is present (length: ' + apiKey.length + ')');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
  }
  return genAI;
}

/**
 * Returns a configured Gemini model instance.
 * Refactored to a function to ensure environment variables are read at runtime.
 */
export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  return getGenAI().getGenerativeModel({ model: modelName });
}

// Deprecated: Use getGeminiModel() instead. 
// Kept as a getter for backward compatibility if possible, but functions are preferred.
export const geminiModel = {
  generateContent: (prompt: any) => getGeminiModel().generateContent(prompt)
};

export async function geminiGenerateText(prompt: string, systemInstruction?: string) {
  console.log('[Gemini] Generating text...');
  const model = getGenAI().getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Imagen integration.
 * Currently, Imagen is typically accessed via Vertex AI or a specific Google Cloud endpoint.
 * This function provides a structure for that integration.
 */
export async function geminiGenerateImage(prompt: string) {
  console.log('[Gemini] Generating image with prompt:', prompt);
  
  // Real Imagen integration would require Google Cloud credentials and Vertex AI SDK.
  // As a more realistic fallback that generates actual images, we use Pollinations AI.
  // In a production environment with Google Cloud, this would be swapped with a real Vertex AI call.
  
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
  
  console.log('[Gemini] Image generated (via Pollinations AI fallback):', imageUrl);

  return {
    url: imageUrl
  };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a ${niche} social media hook and caption for ${platform}. Theme: ${subTheme}. Tone: Premium, authoritative, and minimalist. Include 3 bullet points of actionable advice and 3 trending hashtags.`;
};
