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
      console.error('[Gemini] Primary AI failed:', error.message);
    }
  }

  // FALLBACK 1: Pollinations
  try {
    const response = await fetch(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt + " (Keep it short and premium)")}`);
    if (response.ok) {
      const text = await response.text();
      if (text && !text.includes('error')) return text;
    }
  } catch (e) {
    console.error('[Fallback] Backup AI failed or rate-limited.');
  }

  // FALLBACK 2: Stoic Last Resort (Hardcoded)
  return `STAY FOCUSED. 
  
1. Silence is the ultimate weapon.
2. Build in the dark, let them see the light.
3. Your only competition is your past self.

#Stoic #Luxury #Focus`;
}

export function getGeminiModel(modelName: string = "gemini-1.5-flash") {
  const genAI = getGenAI();
  if (!genAI) {
    return {
      generateContent: async (promptData: any) => {
        let promptText = "Success";
        if (typeof promptData === 'string') promptText = promptData;
        else if (promptData.contents && promptData.contents[0].parts) {
          promptText = promptData.contents[0].parts[0].text;
        }
        const text = await geminiGenerateText(promptText);
        return { response: { text: () => text } };
      }
    } as any;
  }
  return genAI.getGenerativeModel({ model: modelName });
}

export async function geminiGenerateImage(prompt: string) {
  const seed = Math.floor(Math.random() * 1000000);
  return { url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}` };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a viral ${niche} social media hook and caption for ${platform}. Topic: ${subTheme}. Tone: Dark Luxury, Stoic, Aggressive. 3 bullet points, 3 hashtags.`;
};
