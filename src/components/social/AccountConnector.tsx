'use client';

import { Check, Plus, X, Facebook, Instagram, Youtube, Music2 } from 'lucide-react';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { SocialPlatform } from '@/lib/social/providers';

const icons = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
};

export default function AccountConnector() {
  const { accounts, connectAccount, disconnectAccount } = useSocialAccounts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {accounts.map((account) => {
        const Icon = icons[account.platform];
        return (
          <div 
            key={account.platform}
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
              {account.connected ? (
                <button 
                  onClick={() => disconnectAccount(account.platform)}
                  className="p-1 rounded-full hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => connectAccount(account.platform)}
                  className="p-1 rounded-full hover:bg-toxic-gold/20 text-zinc-600 hover:text-toxic-gold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <h4 className="text-white font-bold capitalize mb-1">{account.platform}</h4>
            <p className="text-xs text-zinc-500 font-medium truncate">
              {account.connected ? account.username : 'Not connected'}
            </p>
            {account.connected && (
              <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-toxic-green uppercase tracking-wider">
                <Check className="w-3 h-3" />
                Linked
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
