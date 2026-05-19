'use client';

import { useState } from 'react';
import { Sparkles, Video, Loader2, Download, Play, Layers, Send, CheckCircle2, XCircle } from 'lucide-react';

type PublishStatus = 'idle' | 'loading' | 'success' | 'error';

interface PlatformStatus {
  tiktok: PublishStatus;
  instagram: PublishStatus;
  youtube: PublishStatus;
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [niche, setNiche] = useState('Wealth');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [publishStatus, setPublishStatus] = useState<PlatformStatus>({
    tiktok: 'idle',
    instagram: 'idle',
    youtube: 'idle'
  });

  const generateVideo = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setGeneratedCaption(null);
    setPublishStatus({ tiktok: 'idle', instagram: 'idle', youtube: 'idle' });
    
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, niche, publish: true }),
      });
      const data = await response.json();
      if (data.success) {
        setVideoUrl(data.videoUrl);
        setScenes(data.scenes);
        setGeneratedCaption(data.caption);
      } else {
        setError(data.error || 'Failed to generate video');
      }
    } catch (err) {
      setError('An error occurred while generating the video');
    } finally {
      setLoading(false);
    }
  };

  const publishToAll = async () => {
    if (!videoUrl) return;

    const fullMediaUrl = `${window.location.origin}${videoUrl}`;
    const caption = generatedCaption || `Build the exit quietly. The Silent Architect is a blueprint for escaping burnout, pressure, and dependency — with strategy, not chaos. Link in bio. #${niche.toLowerCase()} #SilentArchitect #ToxicPremium #Success #Mindset #Ambition`;

    const platforms: (keyof PlatformStatus)[] = ['tiktok', 'instagram', 'youtube'];
    
    // Set all to loading
    setPublishStatus({
      tiktok: 'loading',
      instagram: 'loading',
      youtube: 'loading'
    });

    const publishToPlatform = async (platform: keyof PlatformStatus) => {
      try {
        const response = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform,
            content: caption,
            mediaUrl: fullMediaUrl,
            title: prompt // For YouTube
          }),
        });
        
        const data = await response.json();
        setPublishStatus(prev => ({
          ...prev,
          [platform]: data.success ? 'success' : 'error'
        }));
      } catch (err) {
        setPublishStatus(prev => ({
          ...prev,
          [platform]: 'error'
        }));
      }
    };

    // Publish to all simultaneously
    await Promise.all(platforms.map(p => publishToPlatform(p)));
  };

  const getStatusIcon = (status: PublishStatus) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin text-toxic-gold" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-toxic-green" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const isPublishing = Object.values(publishStatus).some(s => s === 'loading');
  const hasPublished = Object.values(publishStatus).some(s => s === 'success' || s === 'error');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/10">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">AI Reel Creator</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 transition-all outline-none"
              >
                <option value="Wealth">Wealth & Luxury</option>
                <option value="Stoicism">Stoicism</option>
                <option value="Motivation">Hard Motivation</option>
                <option value="Toxic">Toxic Premium</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Video Topic / Hook</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Why most people stay poor, The power of silence..."
                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white min-h-[120px] resize-none focus:ring-1 focus:ring-white/20 transition-all outline-none"
              />
            </div>

            <button
              onClick={generateVideo}
              disabled={loading || !prompt || isPublishing}
              className="w-full py-4 bg-white text-black font-extrabold rounded-xl text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-white/5"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'GENERATING REEL...' : 'CREATE AI REEL'}
            </button>
            
            {error && (
              <p className="text-red-500 text-xs font-medium text-center">{error}</p>
            )}
          </div>

          {videoUrl && (
            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Caption</label>
                <p className="text-zinc-400 text-xs italic leading-relaxed">
                  {generatedCaption || "Build the exit quietly..."}
                </p>
              </div>

              <button
                onClick={publishToAll}
                disabled={isPublishing}
                className="w-full py-4 bg-toxic-gold text-black font-extrabold rounded-xl text-sm hover:bg-toxic-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-toxic-gold/10"
              >
                {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isPublishing ? 'PUBLISHING...' : 'PUBLISH TO ALL CHANNELS'}
              </button>

              {hasPublished && (
                <div className="grid grid-cols-3 gap-2">
                  {(['tiktok', 'instagram', 'youtube'] as const).map(p => (
                    <div key={p} className="bg-black/40 border border-zinc-800 rounded-lg p-2 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">{p}</span>
                      {getStatusIcon(publishStatus[p]) || <span className="text-[10px] text-zinc-600">Pending</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {scenes.length > 0 && !videoUrl && (
            <div className="mt-8 space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generated Storyboard</h4>
              <div className="space-y-3">
                {scenes.map((scene, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-zinc-800 flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-white text-xs font-bold line-clamp-1">{scene.narration}</p>
                      <p className="text-zinc-500 text-[10px] line-clamp-1 italic">{scene.visual}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl space-y-6 flex flex-col items-center justify-center min-h-[500px]">
          {videoUrl ? (
            <div className="w-full max-w-[280px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative group">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover"
                autoPlay
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={videoUrl} 
                  download 
                  className="p-2 bg-white text-black rounded-full shadow-xl"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                {loading ? (
                   <div className="relative">
                      <div className="w-12 h-12 border-2 border-white/20 rounded-full border-t-white animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Layers className="w-4 h-4 text-white animate-pulse" />
                      </div>
                   </div>
                ) : (
                  <Play className="w-8 h-8 text-zinc-700 ml-1" />
                )}
              </div>
              <div className="space-y-2 max-w-[280px]">
                <h3 className="text-white font-bold">Video Preview</h3>
                <p className="text-zinc-500 text-sm italic">
                  {loading 
                    ? "Our AI is generating images, synthesizing voiceover, and assembling your cinematic reel..." 
                    : "Once generated, your 9:16 vertical luxury reel will appear here."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
