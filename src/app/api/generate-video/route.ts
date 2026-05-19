import { NextRequest, NextResponse } from 'next/server';
import { geminiGenerateText } from '@/lib/ai/gemini';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as googleTTS from 'google-tts-api';

export async function POST(req: NextRequest) {
  try {
    const { prompt, niche = 'wealth', publish = false } = await req.json();

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
    try {
      const cleanedJson = scriptText.replace(/```json/g, '').replace(/```/g, '').trim();
      scenes = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Failed to parse Gemini script as JSON:", scriptText);
      return NextResponse.json({ error: "Failed to generate valid script", raw: scriptText }, { status: 500 });
    }

    const videoId = uuidv4();
    const tempDir = path.join(process.cwd(), 'tmp', videoId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const sceneFiles: string[] = [];

    // 2. Process Scenes
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imagePath = path.join(tempDir, `image_${i}.jpg`);
      const audioPath = path.join(tempDir, `audio_${i}.mp3`);
      const sceneVideoPath = path.join(tempDir, `scene_${i}.mp4`);

      // Generate Image (Pollinations)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(scene.visual + " dark luxury, cinematic, 8k, highly detailed, vertical aspect ratio 9:16")}?width=720&height=1280&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      const imgRes = await fetch(imageUrl);
      const imgBuffer = await imgRes.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(imgBuffer));

      // Generate Audio (Google TTS)
      const audioUrl = googleTTS.getAudioUrl(scene.narration, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });
      const audioRes = await fetch(audioUrl);
      const audioBuffer = await audioRes.arrayBuffer();
      fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

      // Create video clip for scene
      await new Promise((resolve, reject) => {
        ffmpeg(imagePath)
          .loop(5) 
          .input(audioPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-tune stillimage',
            '-pix_fmt yuv420p',
            '-shortest',
            '-vf scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280'
          ])
          .save(sceneVideoPath)
          .on('end', resolve)
          .on('error', (err) => {
            console.error(`Error generating scene ${i}:`, err);
            reject(err);
          });
      });

      sceneFiles.push(sceneVideoPath);
    }

    // 3. Concatenate Scenes
    const publicVideosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(publicVideosDir)) {
      fs.mkdirSync(publicVideosDir, { recursive: true });
    }
    
    const outputFileName = `${videoId}.mp4`;
    const outputVideoPath = path.join(publicVideosDir, outputFileName);
    const listFilePath = path.join(tempDir, 'list.txt');
    const listContent = sceneFiles.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(listFilePath, listContent);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .save(outputVideoPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error("Error concatenating videos:", err);
          reject(err);
        });
    });

    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.warn("Failed to cleanup temp dir:", tempDir);
    }

    const caption = `Build the exit quietly. The Silent Architect is a blueprint for escaping burnout, pressure, and dependency — with strategy, not chaos. Link in bio. #${niche.toLowerCase()} #SilentArchitect #ToxicPremium #Success #Mindset #Ambition ${additionalHashtags}`;

    return NextResponse.json({ 
      success: true, 
      videoUrl: `/videos/${outputFileName}`,
      scenes: scenes,
      caption: caption,
      publishRequested: publish
    });

  } catch (error: any) {
    console.error("Video generation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
