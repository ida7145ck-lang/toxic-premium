import { getGeminiModel } from '@/lib/ai/gemini';
import Parser from 'rss-parser';

const parser = new Parser();

export interface Trend {
  id: string;
  title: string;
  description: string;
  niche: 'Money' | 'Motivation' | 'Stoicism' | 'Toxic Environments';
  source: string;
  hotness: number; // 1-100
  link?: string;
}

export interface AnalyzedTrend extends Trend {
  aiHooks: string[];
  suggestedImagePrompt: string;
}

const NICHES = {
  Money: 'money making side hustles',
  Motivation: 'motivation discipline',
  Stoicism: 'modern stoicism',
  'Toxic Environments': 'dealing with toxic people',
};

export async function getTrendingTopics(): Promise<Trend[]> {
  try {
    const allTrends: Trend[] = [];

    for (const [niche, query] of Object.entries(NICHES)) {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(url);

      // Take the top 2 from each niche
      feed.items.slice(0, 2).forEach((item, index) => {
        allTrends.push({
          id: `${niche}-${index}`,
          title: item.title || 'Untitled Trend',
          description: item.contentSnippet?.substring(0, 200) || 'No description available',
          niche: niche as any,
          source: item.source || 'Google News',
          hotness: Math.floor(Math.random() * 20) + 75, // Simulate hotness between 75-95
          link: item.link,
        });
      });
    }

    // Sort by simulated hotness
    return allTrends.sort((a, b) => b.hotness - a.hotness);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    // Fallback to mock data if RSS fails
    return [
      {
        id: 'fallback-1',
        title: 'The Rise of Solopreneur AI Agencies',
        description: 'Individuals are using AI to run full-service marketing and automation agencies alone.',
        niche: 'Money',
        source: 'System Fallback',
        hotness: 92,
      },
      {
        id: 'fallback-2',
        title: 'Modern Stoicism for Digital Burnout',
        description: 'Applying Marcus Aurelius principles to survive the 24/7 notification cycle.',
        niche: 'Stoicism',
        source: 'System Fallback',
        hotness: 85,
      }
    ];
  }
}

export async function analyzeTrend(trend: Trend): Promise<AnalyzedTrend> {
  try {
    const prompt = `Analyze this trending topic for a premium social media brand:
    Title: "${trend.title}"
    Description: "${trend.description}"
    Niche: ${trend.niche}

    1. Generate 3 unique, high-impact viral hooks (for TikTok/Instagram) that sound authoritative, minimalist, and "Toxic Premium" (unapologetically ambitious).
    2. Suggest a detailed AI image generation prompt that would visually represent this trend in a "Dark Luxury" 3D style.

    Format your response exactly as:
    HOOKS:
    - [Hook 1]
    - [Hook 2]
    - [Hook 3]
    IMAGE_PROMPT: [Prompt text]`;

    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const content = result.response.text() || '';
    
    // Improved parsing
    const hooksMatch = content.match(/HOOKS:\s*([\s\S]*?)\s*IMAGE_PROMPT:/);
    const hooks = hooksMatch 
      ? hooksMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
      : ['Focus on the signal, ignore the noise.', 'Master your environment or be mastered by it.'];
    
    const imagePromptMatch = content.match(/IMAGE_PROMPT:\s*([\s\S]*)$/);
    const suggestedImagePrompt = imagePromptMatch 
      ? imagePromptMatch[1].trim()
      : `High-end 3D render, luxury aesthetic, ${trend.niche} theme, dark background.`;

    return {
      ...trend,
      aiHooks: hooks.slice(0, 3),
      suggestedImagePrompt,
    };
  } catch (error) {
    console.error('Error analyzing trend:', error);
    return {
      ...trend,
      aiHooks: ['The elite don\'t follow trends, they set them.', 'Excellence is the only standard.', 'Control the narrative.'],
      suggestedImagePrompt: `Premium 3D render, luxury aesthetic, ${trend.niche} theme, dark background, cinematic lighting.`,
    };
  }
}
