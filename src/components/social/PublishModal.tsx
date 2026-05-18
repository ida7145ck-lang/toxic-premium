'use client';

import { useState } from 'react';
import { X, Send, Loader2, CheckCircle2, AlertCircle, Facebook, Instagram, Youtube, Music2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { publishToSocial, SocialPlatform } from '@/lib/social/providers';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  mediaUrl?: string;
}

const icons: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
};

const getIcon = (platform: string) => {
  const Icon = icons[platform.toLowerCase()];
  return Icon || Globe;
};

export default function PublishModal({ isOpen, onClose, content, mediaUrl }: PublishModalProps) {
  const { accounts } = useSocialAccounts();
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<Record<string, { success: boolean; error?: string }>>({});

  const connectedAccounts = accounts.filter(a => a.connected);

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handlePublish = async () => {
    setPublishing(true);
    setResults({});
    
    const publishPromises = selectedPlatforms.map(async (platform) => {
      const res = await publishToSocial({ platform, content, mediaUrl });
      setResults(prev => ({ ...prev, [platform]: res }));
      return { platform, ...res };
    });

    await Promise.all(publishPromises);
    setPublishing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-white font-heading">Publish Content</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Content Preview */}
          <div className="p-4 rounded-xl bg-black/40 border border-zinc-800">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Preview</p>
            <p className="text-zinc-200 text-sm line-clamp-3 italic">"{content}"</p>
            {mediaUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-zinc-800 aspect-video bg-zinc-800 flex items-center justify-center">
                <p className="text-[10px] text-zinc-500 italic">Visual content attached</p>
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Select Platforms</p>
            {connectedAccounts.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 italic">No accounts connected. Please connect accounts in the dashboard.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {connectedAccounts.map((account) => {
                  const Icon = getIcon(account.platform);
                  const isSelected = selectedPlatforms.includes(account.platform);
                  const result = results[account.platform];

                  return (
                    <button
                      key={account.platform}
                      disabled={publishing || result?.success}
                      onClick={() => togglePlatform(account.platform)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-toxic-gold/10 border-toxic-gold text-white' 
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                      } ${result?.success ? 'border-toxic-green text-toxic-green' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-bold text-sm capitalize">{account.platform}</span>
                      <div className="ml-auto">
                        {result?.success ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : result?.error ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : isSelected ? (
                          <div className="w-2 h-2 rounded-full bg-toxic-gold shadow-gold-glow" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-zinc-800/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-700 text-white font-bold hover:bg-zinc-800 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={publishing || selectedPlatforms.length === 0 || Object.values(results).some(r => r.success)}
            onClick={handlePublish}
            className="flex-[2] py-3 rounded-xl bg-gold-gradient text-black font-extrabold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {publishing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Post Now
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
