'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SocialAccount, SocialPlatform } from '@/lib/social/providers';

interface SocialAccountsContextType {
  accounts: SocialAccount[];
  connectAccount: (platform: SocialPlatform, username?: string) => void;
  disconnectAccount: (platform: SocialPlatform) => void;
  addCustomAccount: (platform: string, username: string) => void;
}

const SocialAccountsContext = createContext<SocialAccountsContextType | undefined>(undefined);

export function SocialAccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'facebook', username: "28's beauty", connected: true },
    { platform: 'instagram', username: '@thesilentarchitec', connected: true },
    { platform: 'tiktok', username: '@thesilentarchetec', connected: true },
    { platform: 'youtube', username: '@thesilentarchitec', connected: true },
  ]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('social_accounts');
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    }
  }, []);

  const connectAccount = (platform: SocialPlatform, username?: string) => {
    setAccounts(prev => {
      const updated = prev.map(acc => 
        acc.platform === platform 
          ? { ...acc, connected: true, username: username || acc.username } 
          : acc
      );
      localStorage.setItem('social_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const disconnectAccount = (platform: SocialPlatform) => {
    setAccounts(prev => {
      const updated = prev.map(acc => 
        acc.platform === platform ? { ...acc, connected: false } : acc
      );
      localStorage.setItem('social_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const addCustomAccount = (platform: string, username: string) => {
    setAccounts(prev => {
      const updated = [...prev, { platform, username, connected: true }];
      localStorage.setItem('social_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SocialAccountsContext.Provider value={{ accounts, connectAccount, disconnectAccount, addCustomAccount }}>
      {children}
    </SocialAccountsContext.Provider>
  );
}

export function useSocialAccounts() {
  const context = useContext(SocialAccountsContext);
  if (context === undefined) {
    throw new Error('useSocialAccounts must be used within a SocialAccountsProvider');
  }
  return context;
}
