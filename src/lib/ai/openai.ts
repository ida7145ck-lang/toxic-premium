import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OPENAI_API_KEY is not defined in environment variables');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
});

export const textGenerationTemplate = (niche: string, platform: string, subTheme: string) => {
  return `Generate a ${niche} social media hook and caption for ${platform}. Theme: ${subTheme}. Tone: Premium, authoritative, and minimalist. Include 3 bullet points of actionable advice and 3 trending hashtags.`;
};
