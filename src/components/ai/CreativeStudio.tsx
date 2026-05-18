'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Send, Share2, Loader2, Check, Copy, Music2, Instagram, Facebook, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import PublishModal from '../social/PublishModal';

interface CreativeStudioProps {
  prefillHook?: string;
  prefillPrompt?: string;
  prefillNiche?: string;
}

export default function CreativeStudio({ prefillHook, prefillPrompt, prefillNiche }: CreativeStudioProps) {
  const [niche, setNiche] = useState('Stoicism');
  const [topic, setTopic] = useState('');
  const [generatedText, setResultText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  const { accounts } = useSocialAccounts();
  const tiktokConnected = accounts.find(a => a.platform === 'tiktok')?.connected;

  useEffect(() => {
    if (prefillHook) setTopic(prefillHook);
    if (prefillNiche) setNiche(prefillNiche);
  }, [prefillHook, prefillNiche]);

  const generateText = async () => {
    setLoadingText(true);
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, subTheme: topic || 'Success', platform: 'Instagram' }),
      });
      const data = await response.json();
      setResultText(data.result || data.text || 'Failed to generate text');
    } catch (error) {
      setResultText('Error: Failed to connect to AI');
    } finally {
      setLoadingText(false);
    }
  };

  const generateImage = async () => {
    setLoadingImage(true);
    try {
      const prompt = prefillPrompt || `Premium 3D render, luxury aesthetic, ${niche} theme, ${topic}, cinematic lighting, 8k`;
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, niche }),
      });
      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
    } catch (error) {
      console.error('Image gen failed');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleQuickPublish = () => {
    setIsPublishModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input & Text Area */}
        <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Post Narrative</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-white/20 transition-all outline-none"
                >
                  <option value="Money">Money</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Stoicism">Stoicism</option>
                  <option value="Toxic Environments">Toxic Environments</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Action</label>
                <button
                  onClick={generateText}
                  disabled={loadingText}
                  className="w-full py-2 bg-white text-black font-bold rounded-xl text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingText ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {loadingText ? 'Generating...' : 'Rewrite Hook'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Topic / Context</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What is this post about?"
                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white min-h-[100px] resize-none focus:ring-1 focus:ring-white/20 transition-all outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-black border border-zinc-800 min-h-[150px]">
               {generatedText ? (
                 <p className="text-zinc-300 text-sm italic leading-relaxed whitespace-pre-wrap">{generatedText}</p>
               ) : (
                 <p className="text-zinc-600 text-sm italic text-center py-12">Generated caption will appear here...</p>
               )}
            </div>
          </div>
        </div>

        {/* Visual Area */}
        <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl space-y-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Visual Identity</h3>
            </div>
            <button
              onClick={generateImage}
              disabled={loadingImage}
              className="px-4 py-2 bg-zinc-800 text-white font-bold rounded-xl text-xs hover:bg-zinc-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
              {loadingImage ? 'Rendering...' : 'Generate AI Image'}
            </button>
          </div>

          <div className="flex-1 rounded-2xl border border-zinc-800 bg-black overflow-hidden relative group aspect-square lg:aspect-auto">
            {generatedImageUrl ? (
              <img src={generatedImageUrl} alt="Generated" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-12 text-center">
                <ImageIcon className="w-12 h-12 text-zinc-800" />
                <p className="text-zinc-600 text-sm">Visuals generated by Toxic AI will be displayed here in 8K quality.</p>
              </div>
            )}
            
            {loadingImage && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                   <div className="w-12 h-12 border-2 border-toxic-gold border-t-transparent rounded-full animate-spin" />
                   <p className="text-toxic-gold font-bold text-xs uppercase tracking-widest animate-pulse">Rendering Luxury...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Action Bar */}
      <div className="p-6 rounded-3xl bg-gold-gradient-dark border border-toxic-gold/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-toxic-gold/5">
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
             <div className={`p-2 rounded-full border border-black bg-zinc-900 ${tiktokConnected ? 'text-toxic-green' : 'text-zinc-600'}`}>
                <Music2 className="w-4 h-4" />
             </div>
             <div className="p-2 rounded-full border border-black bg-zinc-900 text-zinc-600">
                <Instagram className="w-4 h-4" />
             </div>
             <div className="p-2 rounded-full border border-black bg-zinc-900 text-zinc-600">
                <Facebook className="w-4 h-4" />
             </div>
           </div>
           <div>
             <p className="text-white font-bold text-sm">Ready to Dominate?</p>
             <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
               {tiktokConnected ? 'TikTok Connected' : 'Connect socials to post directly'}
             </p>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => window.location.href = '#viral-trends'}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all"
          >
            Connect TikTok
          </button>
          <button
            disabled={!generatedText || loadingText || loadingImage}
            onClick={handleQuickPublish}
            className="flex-1 md:flex-none px-10 py-3 rounded-xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-4 h-4" />
            PUBLISH TO CONNECTED
          </button>
        </div>
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        content={generatedText}
        mediaUrl={generatedImageUrl}
      />
    </div>
  );
}
