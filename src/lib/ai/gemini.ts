import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Robustly retrieves the GoogleGenerativeAI client.
 * Does not cache a failed initialization to ensure it can recover if the 
 * environment variable becomes available later.
 */
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'dummy-key') {
    console.error('[Gemini] GEMINI_API_KEY is NOT defined or is set to default dummy value.');
    // We return a client with the dummy key so it doesn't crash, 
    // but the actual call will fail with a clear message.
    return new GoogleGenerativeAI(apiKey || 'dummy-key');
  }

  // Debugging: Log key presence and partial signature safely
  const keyLen = apiKey.length;
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(keyLen - 4);
  console.log(\`[Gemini] Initializing client with API Key: \${start}...\${end} (length: \${keyLen})\`);

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Returns a configured Gemini model instance.
 */
export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  return getGenAI().getGenerativeModel({ model: modelName });
}

// Deprecated: Use getGeminiModel() instead.
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
    const text = response.text();
    console.log('[Gemini] Text generation successful.');
    return text;
  } catch (error: any) {
    console.error('[Gemini] Text generation failed:', error.message);
    throw error;
  }
}

/**
 * Imagen integration.
 * Currently uses Pollinations AI as a high-quality fallback for the luxury aesthetic.
 */
export async function geminiGenerateImage(prompt: string) {
  console.log('[Gemini] Requesting image generation for prompt:', prompt);
  
  // Real Imagen integration usually requires Vertex AI.
  // We use Pollinations AI as it produces high-end visuals compatible with the brand.
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=\${seed}\`;
  
  console.log('[Gemini] Image generated successfully:', imageUrl);

  return {
    url: imageUrl
  };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return \`Generate a \${niche} social media hook and caption for \${platform}. Theme: \${subTheme}. Tone: Premium, authoritative, and minimalist. Include 3 bullet points of actionable advice and 3 trending hashtags.\`;
};
