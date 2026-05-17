'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Copy, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PublishModal from '../social/PublishModal';

interface TextGeneratorProps {
  prefillTopic?: string;
  prefillNiche?: string;
}

export default function TextGenerator({ prefillTopic, prefillNiche }: TextGeneratorProps) {
  const [niche, setNiche] = useState('Stoicism');
  const [platform, setPlatform] = useState('Instagram');
  const [subTheme, setSubTheme] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  useEffect(() => {
    if (prefillTopic) setSubTheme(prefillTopic);
    if (prefillNiche) setNiche(prefillNiche);
  }, [prefillTopic, prefillNiche]);

  const niches = ['Money', 'Motivation', 'Stoicism', 'Toxic Environments'];
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook'];

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, platform, subTheme: subTheme || 'General wisdom' }),
      });
      const data = await response.json();
      if (data.result) {
        setResult(data.result);
      } else {
        setResult('Error: ' + (data.error || 'Failed to generate content'));
      }
    } catch (error) {
      setResult('Error: Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-white/10">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">AI Text Generator</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Niche</label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            >
              {niches.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Topic / Sub-theme</label>
          <input
            type="text"
            value={subTheme}
            onChange={(e) => setSubTheme(e.target.value)}
            placeholder="e.g. Resilience in hard times"
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Premium Content'
          )}
        </button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative mt-8 p-6 rounded-2xl bg-black/40 border border-zinc-800"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="p-2 rounded-lg bg-toxic-gold/10 hover:bg-toxic-gold/20 text-toxic-gold transition-all"
                  title="Publish to Social Media"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)} 
        content={result} 
      />
    </div>
  );
}
