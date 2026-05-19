'use client';

import { useState, useCallback, useRef } from 'react';

export function useVideoAssembly() {
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const assembleVideo = useCallback(async (scenes: any[]) => {
    if (!scenes || scenes.length === 0) return null;
    
    setIsAssembling(true);
    setAssemblyProgress(0);
    setVideoBlob(null);

    try {
      const canvas = document.createElement('canvas');
      // Vertical 9:16 aspect ratio
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Failed to get canvas context');

      // Initialize Audio Context
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioContextClass();
      const dest = audioCtx.createMediaStreamDestination();
      
      // Setup MediaRecorder
      const canvasStream = canvas.captureStream(30); // 30 FPS
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      // Find supported mime type
      const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      const mimeType = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
      
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000 // 5Mbps for decent quality
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      const recordingPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const type = mimeType.split(';')[0] || 'video/webm';
          resolve(new Blob(chunks, { type }));
        };
        recorder.onerror = (e) => reject(e);
      });

      recorder.start();

      // Process scenes one by one
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        setAssemblyProgress(Math.floor((i / scenes.length) * 100));

        // Load image
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error(`Failed to load image: ${scene.imageUrl}`));
          img.src = scene.imageUrl;
        });

        // Load audio
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.src = scene.audioUrl;
        
        // Wait for audio to be ready to play
        await new Promise((resolve) => {
          audio.oncanplaythrough = resolve;
          audio.load();
        });

        const source = audioCtx.createMediaElementSource(audio);
        source.connect(dest);
        source.connect(audioCtx.destination);

        // Record the scene for the duration of the audio
        await new Promise((resolve) => {
          audio.onended = resolve;
          
          let animationFrameId: number;
          const drawFrame = () => {
            if (audio.paused || audio.ended) {
              cancelAnimationFrame(animationFrameId);
              return;
            }
            
            // Draw background (black)
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw image (cover style)
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            
            // Optional: Subtle zoom effect
            // const zoom = 1 + (audio.currentTime / audio.duration) * 0.1;
            // ctx.drawImage(img, x - (w*zoom-w)/2, y - (h*zoom-h)/2, w*zoom, h*zoom);

            animationFrameId = requestAnimationFrame(drawFrame);
          };
          
          audio.play().then(() => {
            animationFrameId = requestAnimationFrame(drawFrame);
          });
        });
        
        source.disconnect();
      }

      recorder.stop();
      const finalBlob = await recordingPromise;
      setVideoBlob(finalBlob);
      setAssemblyProgress(100);
      
      // Close audio context
      await audioCtx.close();
      
      return finalBlob;
    } catch (err) {
      console.error('Video assembly failed:', err);
      setIsAssembling(false);
      throw err;
    } finally {
      setIsAssembling(false);
    }
  }, []);

  return { assembleVideo, isAssembling, assemblyProgress, videoBlob };
}
