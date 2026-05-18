'use client';

import { useState } from 'react';
import { Check, Plus, X, Facebook, Instagram, Youtube, Music2, Loader2, Globe } from 'lucide-react';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { SocialPlatform } from '@/lib/social/providers';

const icons: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
};

export default function AccountConnector() {
  const { accounts, connectAccount, disconnectAccount, addCustomAccount } = useSocialAccounts();
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});
  const [handles, setHandles] = useState<Record<string, string>>({});
  
  // Custom platform state
  const [showCustom, setShowCustom] = useState(false);
  const [customPlatform, setCustomPlatform] = useState('');
  const [customHandle, setCustomHandle] = useState('');

  const handleConnect = async (platform: SocialPlatform) => {
    const handle = handles[platform];
    if (!handle) return;

    setConnecting(prev => ({ ...prev, [platform]: true }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    connectAccount(platform, handle);
    setConnecting(prev => ({ ...prev, [platform]: false }));
  };

  const handleAddCustom = async () => {
    if (!customPlatform || !customHandle) return;
    
    setConnecting(prev => ({ ...prev, custom: true }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    addCustomAccount(customPlatform, customHandle);
    setConnecting(prev => ({ ...prev, custom: false }));
    setCustomPlatform('');
    setCustomHandle('');
    setShowCustom(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((account) => {
          const Icon = icons[account.platform] || Globe;
          const isConnecting = connecting[account.platform];
          
          return (
            <div 
              key={`${account.platform}-${account.username}`}
              className={`p-6 rounded-2xl border transition-all ${
                account.connected 
                ? 'bg-zinc-800/40 border-toxic-green/30 shadow-green-glow' 
                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${account.connected ? 'bg-toxic-green/10' : 'bg-zinc-800'}`}>
                  <Icon className={`w-6 h-6 ${account.connected ? 'text-toxic-green' : 'text-zinc-500'}`} />
                </div>
                {account.connected && (
                  <button 
                    onClick={() => disconnectAccount(account.platform)}
                    className="p-1 rounded-full hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h4 className="text-white font-bold capitalize mb-1">{account.platform}</h4>
              
              {account.connected ? (
                <>
                  <p className="text-xs text-zinc-500 font-medium truncate mb-4">
                    {account.username}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-toxic-green uppercase tracking-wider">
                    <Check className="w-3 h-3" />
                    Linked
                  </div>
                </>
              ) : (
                <div className="space-y-3 mt-4">
                  <input
                    type="text"
                    placeholder={`Your ${account.platform} @handle`}
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-toxic-gold/50 transition-all"
                    value={handles[account.platform] || ''}
                    onChange={(e) => setHandles(prev => ({ ...prev, [account.platform]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect(account.platform)}
                  />
                  <button
                    onClick={() => handleConnect(account.platform)}
                    disabled={isConnecting || !handles[account.platform]}
                    className="w-full py-2 bg-toxic-gold text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Link Account
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Custom Platform Trigger */}
        {!showCustom && (
          <button 
            onClick={() => setShowCustom(true)}
            className="p-6 rounded-2xl border border-dashed border-zinc-800 bg-transparent hover:bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-full bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
              <Plus className="w-6 h-6 text-zinc-500 group-hover:text-toxic-gold" />
            </div>
            <span className="text-xs font-bold text-zinc-500 group-hover:text-white uppercase tracking-wider">Add Custom Platform</span>
          </button>
        )}

        {/* Custom Platform Form */}
        {showCustom && (
          <div className="p-6 rounded-2xl border border-toxic-gold/30 bg-zinc-900/60 shadow-lg animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-tight">New Platform</h4>
              <button onClick={() => setShowCustom(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Platform Name (e.g. X, LinkedIn)"
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-toxic-gold/50"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
              />
              <input
                type="text"
                placeholder="Your Handle"
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-toxic-gold/50"
                value={customHandle}
                onChange={(e) => setCustomHandle(e.target.value)}
              />
              <button
                onClick={handleAddCustom}
                disabled={connecting.custom || !customPlatform || !customHandle}
                className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-toxic-gold transition-all"
              >
                {connecting.custom ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Add Platform
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
