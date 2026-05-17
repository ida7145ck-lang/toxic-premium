import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function geminiGenerateText(prompt: string, systemInstruction?: string) {
  const model = genAI.getGenerativeModel({ 
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
  // Placeholder for Imagen implementation.
  // In a production environment with Google Cloud, this would use Vertex AI SDK 
  // or a fetch to the AI Platform endpoint.
  
  console.log('Generating image with prompt:', prompt);
  
  // For now, we'll return a placeholder or simulate a response 
  // if no real Imagen credentials/endpoint are provided.
  // Ideally, this would be:
  /*
  const response = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ... })
  });
  */
  
  // To keep the app "functional" for the demo/task:
  return {
    url: `https://placehold.co/1024x1024/000000/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 30))}`
  };
}

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a ${niche} social media hook and caption for ${platform}. Theme: ${subTheme}. Tone: Premium, authoritative, and minimalist. Include 3 bullet points of actionable advice and 3 trending hashtags.`;
};
