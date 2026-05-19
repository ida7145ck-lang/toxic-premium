'use client';

import { useState, useCallback } from 'react';

export function useVideoAssembly() {
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assembleVideo = useCallback(async (scenes: any[]) => {
    if (!scenes || scenes.length === 0) return null;
    
    setIsAssembling(true);
    setAssemblyProgress(0);
    setVideoBlob(null);
    setError(null);

    try {
      // Create canvas with vertical 9:16 aspect ratio
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Initialize MediaRecorder first
      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
        ? 'video/webm; codecs=vp9' 
        : MediaRecorder.isTypeSupported('video/webm') 
          ? 'video/webm' 
          : 'video/mp4';

      const chunks: Blob[] = [];
      
      // Create audio context
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType.includes('webm') ? 'video/webm' : 'video/mp4',
        videoBitsPerSecond: 5000000
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const finalType = mimeType.includes('webm') ? 'video/webm' : 'video/mp4';
          resolve(new Blob(chunks, { type: finalType }));
        };
        recorder.onerror = (e) => reject(e);
      });

      recorder.start(1000); // Collect data every second

      // Process each scene
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        setAssemblyProgress(Math.floor((i / scenes.length) * 90));

        try {
          // Load image with CORS handling
          const img = await loadImage(scene.imageUrl);
          
          // Load audio
          const audio = await loadAudio(scene.audioUrl);
          
          // Connect audio
          const source = audioCtx.createMediaElementSource(audio);
          source.connect(dest);
          source.connect(audioCtx.destination);

          // Play audio and draw while recording
          audio.play();

          // Draw until audio ends
          await drawWhilePlaying(ctx, img, audio, canvas);

          source.disconnect();
        } catch (sceneErr) {
          console.warn(`Scene ${i} failed, using fallback:`, sceneErr);
          // Draw a fallback frame for this scene
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(scene.narration || 'Toxic Premium', canvas.width / 2, canvas.height / 2);
          
          // Still record for a few seconds
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      recorder.stop();
      const finalBlob = await recordingPromise;
      setVideoBlob(finalBlob);
      setAssemblyProgress(100);
      
      await audioCtx.close();
      return finalBlob;

    } catch (err) {
      console.error('Video assembly failed:', err);
      setError(err instanceof Error ? err.message : 'Video assembly failed');
      setIsAssembling(false);
      return null;
    }
  }, []);

  return { assembleVideo, isAssembling, assemblyProgress, videoBlob, error };
}

// Helper: Load image with proper CORS handling
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Try without CORS for external images
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img2.src = url;
    };
    img.src = url;
  });
}

// Helper: Load audio with CORS handling
async function loadAudio(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = () => {
      // Retry without CORS
      const audio2 = new Audio();
      audio2.oncanplaythrough = () => resolve(audio2);
      audio2.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio2.src = url;
    };
    audio.src = url;
  });
}

// Helper: Draw to canvas while audio plays
async function drawWhilePlaying(
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  audio: HTMLAudioElement, 
  canvas: HTMLCanvasElement
): Promise<void> {
  return new Promise((resolve) => {
    const animate = () => {
      if (audio.paused || audio.ended) {
        // Draw final frame
        drawImageCover(ctx, img, canvas.width, canvas.height);
        resolve();
        return;
      }
      
      // Draw current frame
      drawImageCover(ctx, img, canvas.width, canvas.height);
      requestAnimationFrame(animate);
    };
    
    // Wait for audio to actually start playing
    if (audio.paused) {
      audio.play().then(() => animate()).catch(() => resolve());
    } else {
      animate();
    }
  });
}

// Helper: Draw image with cover style (fill, centered, cropped)
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  // Fill black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // Calculate cover scaling
  const scale = Math.max(width / img.width, height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (width - w) / 2;
  const y = (height - h) / 2;
  
  // Draw image centered
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    // Fallback: draw placeholder
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
  }
}