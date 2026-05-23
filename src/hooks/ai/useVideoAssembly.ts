'use client';

import { useState, useCallback } from 'react';

export function useVideoAssembly() {
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assembleVideo = useCallback(async (scenes: any[]) => {
    if (!scenes || scenes.length === 0) {
      setError('No scenes to assemble');
      return null;
    }
    
    setIsAssembling(true);
    setAssemblyProgress(0);
    setVideoBlob(null);
    setError(null);

    try {
      // Create canvas with vertical 9:16 aspect ratio
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Failed to get canvas context');

      // Determine mime type
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }

      const chunks: Blob[] = [];
      
      // Audio context for processing
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create stream destination for audio
      const dest = audioCtx.createMediaStreamDestination();

      // Capture canvas at 30fps
      const canvasStream = canvas.captureStream(30);
      
      // Combine video tracks from canvas and audio tracks
      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
      dest.stream.getAudioTracks().forEach(t => combinedStream.addTrack(t));

      // Create recorder
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 4000000 // 4 Mbps
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordingPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          console.log(`[Assembly] Recording stopped, ${chunks.length} chunks`);
          if (chunks.length === 0) {
            reject(new Error('No video data recorded'));
            return;
          }
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = (e) => {
          console.error('[Assembly] Recorder error:', e);
          reject(e);
        };
      });

      // Start recording
      recorder.start(500); // Collect data every 500ms
      console.log('[Assembly] Recording started');

      // Preload all images first
      const loadedImages: HTMLImageElement[] = [];
      for (let i = 0; i < scenes.length; i++) {
        setAssemblyProgress(5 + Math.floor((i / scenes.length) * 20));
        try {
          const img = await loadImage(scenes[i].imageUrl);
          loadedImages.push(img);
        } catch (err) {
          console.warn(`[Assembly] Failed to load image ${i}, using fallback`);
          // Create fallback image
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = 720;
          fallbackCanvas.height = 1280;
          const fCtx = fallbackCanvas.getContext('2d');
          if (fCtx) {
            fCtx.fillStyle = '#0a0a0a';
            fCtx.fillRect(0, 0, 720, 1280);
            fCtx.fillStyle = '#d4af37';
            fCtx.font = 'bold 28px sans-serif';
            fCtx.textAlign = 'center';
            fCtx.fillText(scenes[i].narration || 'Toxic Premium', 360, 640);
          }
          const fallbackImg = new Image();
          fallbackImg.src = fallbackCanvas.toDataURL();
          await new Promise(res => { fallbackImg.onload = res; setTimeout(res, 100); });
          loadedImages.push(fallbackImg);
        }
      }

      console.log(`[Assembly] ${loadedImages.length} images preloaded`);

      // Now process scenes and record
      const totalDuration = scenes.length * 5; // Assume ~5 seconds per scene
      let elapsed = 0;
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const img = loadedImages[i];
        
        setAssemblyProgress(25 + Math.floor((i / scenes.length) * 60));

        // Try to load and play audio
        let audioDuration = 5000; // Default 5 seconds
        try {
          const audio = await loadAudio(scene.audioUrl);
          const source = audioCtx.createMediaElementSource(audio);
          source.connect(dest);
          source.connect(audioCtx.destination);
          
          // Play audio
          audio.play().catch(() => {});
          
          // Get actual duration
          if (audio.duration && isFinite(audio.duration)) {
            audioDuration = Math.min(audio.duration * 1000, 10000); // Cap at 10 seconds
          }
          
          // Draw while audio plays
          const startTime = Date.now();
          const drawScene = () => {
            const progress = (Date.now() - startTime) / audioDuration;
            if (progress < 1) {
              drawImageCover(ctx, img, 720, 1280);
              requestAnimationFrame(drawScene);
            }
          };
          drawScene();
          
          // Wait for audio duration
          await new Promise(resolve => {
            audio.onended = resolve;
            setTimeout(resolve, audioDuration);
          });
          
          source.disconnect();
        } catch (audioErr) {
          console.warn(`[Assembly] Audio failed for scene ${i}, using fallback timing`);
          // Just draw the image for a few seconds
          drawImageCover(ctx, img, 720, 1280);
          await new Promise(r => setTimeout(r, 4000));
        }
        
        elapsed += audioDuration;
      }

      // Draw final frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 720, 1280);
      
      // Stop recording
      recorder.stop();
      console.log('[Assembly] Recorder stopped, waiting for blob...');

      const blob = await recordingPromise;
      console.log(`[Assembly] Video assembled: ${blob.size} bytes`);
      
      setVideoBlob(blob);
      setAssemblyProgress(100);
      
      await audioCtx.close();
      return blob;

    } catch (err) {
      console.error('[Assembly] Failed:', err);
      setError(err instanceof Error ? err.message : 'Video assembly failed');
      setIsAssembling(false);
      return null;
    } finally {
      setIsAssembling(false);
    }
  }, []);

  return { assembleVideo, isAssembling, assemblyProgress, videoBlob, error };
}

// Helper: Load image with CORS handling
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let crossOriginSet = false;
    
    img.onload = () => {
      // If image is too small (< 10px), it might be an error placeholder
      if (img.width < 10 || img.height < 10) {
        reject(new Error('Image too small'));
        return;
      }
      resolve(img);
    };
    
    img.onerror = () => {
      // Try without CORS for images that might not support it
      if (!crossOriginSet) {
        crossOriginSet = true;
        const img2 = new Image();
        img2.onload = () => resolve(img2);
        img2.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img2.src = url;
      } else {
        reject(new Error(`Failed to load image: ${url}`));
      }
    };
    
    // Try with CORS first
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

// Helper: Load audio with CORS handling  
async function loadAudio(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    let crossOriginSet = false;
    
    const onCanPlay = () => {
      console.log('[Audio] Ready:', url);
      resolve(audio);
    };
    
    audio.oncanplaythrough = onCanPlay;
    audio.onerror = () => {
      if (!crossOriginSet) {
        crossOriginSet = true;
        const audio2 = new Audio();
        audio2.oncanplaythrough = onCanPlay;
        audio2.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
        audio2.src = url;
      } else {
        reject(new Error(`Failed to load audio: ${url}`));
      }
    };
    
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    audio.load();
  });
}

// Helper: Draw image with cover style
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  // Clear with black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // If image not loaded, show placeholder
  if (!img || !img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Toxic Premium', width / 2, height / 2);
    return;
  }
  
  try {
    // Calculate cover scaling
    const scale = Math.max(width / img.width, height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    
    ctx.drawImage(img, x, y, w, h);
  } catch (e) {
    console.warn('[Draw] Failed to draw image:', e);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
  }
}