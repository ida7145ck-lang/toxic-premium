import { NextRequest, NextResponse } from 'next/server';
import { geminiGenerateText } from '@/lib/ai/gemini';
import * as googleTTS from 'google-tts-api';

export async function POST(req: NextRequest) {
  try {
    const { prompt, niche = 'wealth' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Define theme focus based on niche
    let themeFocus = "";
    let additionalHashtags = "";
    
    const nicheLower = niche.toLowerCase();
    if (nicheLower.includes('wealth') || nicheLower.includes('money')) {
      themeFocus = "Focus on Money (Wealth building, financial freedom, passive income, investing, escaping the rat race) and Leadership (Silent leadership, commanding respect without begging for it, building empires).";
      additionalHashtags = "#Wealth #FinancialFreedom #Empire";
    } else if (nicheLower.includes('stoic')) {
      themeFocus = "Focus on Stoicism for the Modern World (Emotional detachment, not caring what others think, turning pain into fuel, staying ice cold in chaos) and Leadership (Silent leadership, commanding respect, building empires).";
      additionalHashtags = "#Stoic #Mindset #IceCold";
    } else if (nicheLower.includes('motivation')) {
      themeFocus = "Focus on Motivation (Hard work, discipline, delayed gratification, outworking everyone) and Toxic Environments & People (Removing fake people, cutting off energy vampires, building walls, choosing peace over drama).";
      additionalHashtags = "#Motivation #Discipline #NoExcuses";
    } else {
      // Toxic Premium or default
      themeFocus = "Incorporate all themes: Motivation (discipline, hard work), Money (wealth, freedom), Leadership (respect, empires), Toxic Environments (removing fake people, choosing peace), and Stoicism (detachment, turning pain into fuel).";
      additionalHashtags = "#ToxicPremium #Success #Leader";
    }

    // 1. Generate Script
    const scriptPrompt = `Create a short video script for a 9:16 vertical reel about: ${prompt}. 
    Niche: ${niche}. Tone: Dark Luxury, Stoic, Aggressive.
    ${themeFocus}
    The script should have 3 scenes. Each scene needs:
    - narration: A powerful, short hook (max 10 words)
    - visual: A descriptive prompt for an AI image generator (e.g. "A hooded man standing in front of a black Lamborghini, dark rainy night, cinematic lighting")
    Return ONLY a valid JSON array of objects, like this:
    [
      {"narration": "...", "visual": "..."},
      {"narration": "...", "visual": "..."},
      {"narration": "...", "visual": "..." }
    ]`;

    const scriptText = await geminiGenerateText(scriptPrompt, "You are a viral content creator specializing in dark luxury aesthetic and high-performance psychology. You only respond with JSON.");
    
    let scenes;
    
    // Robust JSON parsing
    try {
      let cleanedJson = scriptText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      try {
        scenes = JSON.parse(cleanedJson);
      } catch {
        const jsonMatch = cleanedJson.match(/\[[\s\S]*?\]\s*$/);
        if (jsonMatch) {
          try {
            scenes = JSON.parse(jsonMatch[0]);
          } catch {
            const objectsMatch = cleanedJson.match(/\{"[^}]*"\}/g);
            if (objectsMatch && objectsMatch.length >= 3) {
              scenes = objectsMatch.slice(0, 3).map(s => JSON.parse(s));
            }
          }
        }
      }
      
      if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
        scenes = [
          { narration: "Build your empire in silence.", visual: "A lone figure on a rooftop at night, city skyline, luxury and power, cinematic dark lighting" },
          { narration: "They underestimate the quiet ones.", visual: "A dark mansion with a single light on, storm clouds, mysterious and powerful" },
          { narration: "Your grind speaks louder than words.", visual: "A man working alone at desk, neon lights from window, determination and focus" }
        ];
      }
    } catch (e) {
      scenes = [
        { narration: "Build your empire in silence.", visual: "A lone figure on a rooftop at night, city skyline, luxury and power, cinematic dark lighting" },
        { narration: "They underestimate the quiet ones.", visual: "A dark mansion with a single light on, storm clouds, mysterious and powerful" },
        { narration: "Your grind speaks louder than words.", visual: "A man working alone at desk, neon lights from window, determination and focus" }
      ];
    }

    // 2. Add URLs to scenes
    const scenesWithUrls = scenes.map((scene: any) => {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(scene.visual + " dark luxury, cinematic, 8k, highly detailed, vertical aspect ratio 9:16")}?width=720&height=1280&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      const audioUrl = googleTTS.getAudioUrl(scene.narration, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });
      return { ...scene, imageUrl, audioUrl };
    });

    const caption = `Build the exit quietly. The Silent Architect is a blueprint for escaping burnout, pressure, and dependency — with strategy, not chaos. Link in bio. #${niche.toLowerCase()} #SilentArchitect #ToxicPremium #Success #Mindset #Ambition ${additionalHashtags}`;

    return NextResponse.json({ 
      success: true, 
      scenes: scenesWithUrls,
      caption: caption
    });

  } catch (error: any) {
    console.error("Script generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
