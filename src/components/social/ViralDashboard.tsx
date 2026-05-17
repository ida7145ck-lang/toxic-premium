'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Zap, ArrowRight, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trend, AnalyzedTrend } from '@/lib/social/trends';
import AccountConnector from './AccountConnector';
import PublishModal from './PublishModal';

interface ViralDashboardProps {
  onSelectTrend?: (hook: string, prompt: string, niche: string) => void;
}

export default function ViralDashboard({ onSelectTrend }: ViralDashboardProps) {
  const [trends, setTrends] = useState<(Trend | AnalyzedTrend)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<AnalyzedTrend | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishContent, setPublishContent] = useState('');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trends');
      const data = await response.json();
      if (data.trends) {
        setTrends(data.trends);
        // Default select the first analyzed trend
        const firstAnalyzed = data.trends.find((t: any) => 'aiHooks' in t);
        if (firstAnalyzed) setSelectedTrend(firstAnalyzed as AnalyzedTrend);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendClick = (trend: Trend | AnalyzedTrend) => {
    if ('aiHooks' in trend) {
      setSelectedTrend(trend as AnalyzedTrend);
    } else {
      // If not analyzed yet, we could trigger analysis here
      // For this implementation, the API analyzes top 3
      setSelectedTrend(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-toxic-gold/10 border border-toxic-gold/20">
            <TrendingUp className="w-8 h-8 text-toxic-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-heading uppercase">Viral Pulse</h2>
            <p className="text-zinc-500 text-sm">Real-time AI trend discovery and hook optimization</p>
          </div>
        </div>
        <button 
          onClick={fetchTrends}
          className="px-6 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-all text-sm font-medium"
        >
          Refresh Trends
        </button>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Connected Platforms</h3>
        <AccountConnector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4">Trending Now</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-zinc-800/20 animate-pulse border border-zinc-800/50" />
              ))}
            </div>
          ) : (
            trends.map((trend) => (
              <motion.div
                key={trend.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleTrendClick(trend)}
                className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                  selectedTrend?.id === trend.id 
                  ? 'bg-zinc-800/50 border-toxic-gold shadow-gold-glow' 
                  : 'bg-black/20 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase tracking-tighter">
                    {trend.niche}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap className={`w-3 h-3 ${trend.hotness > 85 ? 'text-toxic-gold animate-pulse' : 'text-zinc-600'}`} />
                    <span className="text-xs font-bold text-zinc-500">{trend.hotness}%</span>
                  </div>
                </div>
                <h4 className="text-white font-bold text-lg leading-tight mb-1">{trend.title}</h4>
                <p className="text-zinc-500 text-xs line-clamp-1">{trend.description}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* AI Analysis / Action Area */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedTrend ? (
              <motion.div
                key={selectedTrend.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="p-8 rounded-3xl bg-zinc-800/20 border border-zinc-700/30 flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-toxic-gold" />
                    <h3 className="text-sm font-bold text-toxic-gold uppercase tracking-widest">AI Intelligence</h3>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{selectedTrend.title}</h4>
                      <p className="text-zinc-400 leading-relaxed">{selectedTrend.description}</p>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Optimized Hooks</h5>
                      {selectedTrend.aiHooks.map((hook, i) => (
                        <div key={i} className="group relative p-4 rounded-xl bg-black/40 border border-zinc-800 overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-toxic-gold transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-zinc-200 font-medium leading-relaxed italic">"{hook}"</p>
                            <button
                              onClick={() => {
                                setPublishContent(hook);
                                setIsPublishModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-toxic-gold hover:bg-toxic-gold/10 transition-all"
                              title="Quick Publish"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          if (onSelectTrend) {
                            onSelectTrend(selectedTrend.aiHooks[0], '', selectedTrend.niche);
                          } else {
                            navigator.clipboard.writeText(selectedTrend.aiHooks[0]);
                          }
                          document.getElementById('ai-tools')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white text-black font-bold hover:bg-toxic-gold transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                        Generate Text
                      </button>
                      <button 
                        onClick={() => {
                          if (onSelectTrend) {
                            onSelectTrend('', selectedTrend.suggestedImagePrompt, selectedTrend.niche);
                          } else {
                            navigator.clipboard.writeText(selectedTrend.suggestedImagePrompt);
                          }
                          document.getElementById('ai-tools')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-zinc-700 text-white font-bold hover:bg-zinc-800 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5" />
                        Create Visual
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-zinc-800 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-500 mb-2">Select a trend to analyze</h3>
                <p className="text-zinc-600 text-sm max-w-xs">Our AI Core will extract high-impact hooks and suggest visual prompts for your content.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)} 
        content={publishContent} 
      />
    </div>
  );
}
