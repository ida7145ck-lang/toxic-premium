'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Download, RefreshCw, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublishModal from '../social/PublishModal';

interface ImageGeneratorProps {
  prefillPrompt?: string;
}

export default function ImageGenerator({ prefillPrompt }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  useEffect(() => {
    if (prefillPrompt) setPrompt(prefillPrompt);
  }, [prefillPrompt]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setImageUrl('');
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        alert('Error: ' + (data.error || 'Failed to generate image'));
      }
    } catch (error) {
      alert('Error: Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "Floating golden bitcoin symbols in a glass sphere",
    "Abstract marble bust of a philosopher with digital glitch effects",
    "Sharp obsidian shards breaking through a smooth glass surface"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-white/10">
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">AI Image Generator</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Describe your vision</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A minimalist marble sculpture of a lion, golden cracks..."
            className="w-full h-32 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all border border-zinc-700"
            >
              {ex.length > 30 ? ex.substring(0, 30) + '...' : ex}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Rendering Art...
            </>
          ) : (
            'Generate Premium Visual'
          )}
        </button>

        <AnimatePresence mode="wait">
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 rounded-2xl overflow-hidden bg-black/40 border border-zinc-800 group relative"
            >
              <img src={imageUrl} alt="AI Generated" className="w-full h-auto" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="p-3 rounded-full bg-toxic-gold text-black hover:bg-toxic-gold-light transition-all"
                  title="Publish to Social Media"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                <a
                  href={imageUrl}
                  download="toxic-premium-ai.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white text-black hover:bg-zinc-200 transition-all"
                >
                  <Download className="w-6 h-6" />
                </a>
                <button
                  onClick={handleGenerate}
                  className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {loading && !imageUrl && (
          <div className="mt-8 aspect-square rounded-2xl bg-zinc-800/30 border border-zinc-800/50 border-dashed flex flex-col items-center justify-center gap-4 animate-pulse">
            <Loader2 className="w-12 h-12 text-zinc-600 animate-spin" />
            <p className="text-zinc-500 font-medium text-sm">AI is painting your masterpiece...</p>
          </div>
        )}
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)} 
        content="Check out this premium AI-generated visual for Toxic Premium."
        mediaUrl={imageUrl}
      />
    </div>
  );
}
