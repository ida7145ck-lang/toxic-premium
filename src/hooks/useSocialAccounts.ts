import { useState, useEffect } from 'react';
import { SocialAccount, SocialPlatform } from '@/lib/social/providers';
import { useSearchParams, useRouter } from 'next/navigation';

export function useSocialAccounts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'facebook', username: 'Toxic Premium Page', connected: false },
    { platform: 'instagram', username: '@toxic.premium', connected: false },
    { platform: 'tiktok', username: '@toxic_premium', connected: false },
    { platform: 'youtube', username: 'Toxic Premium Official', connected: false },
  ]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('social_accounts');
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    }

    // Handle redirect success (backward compatibility)
    const connectedProvider = searchParams.get('connected');
    if (connectedProvider) {
      connectAccount(connectedProvider as SocialPlatform);
      router.replace('/');
    }
  }, [searchParams, router]);

  const connectAccount = (platform: SocialPlatform) => {
    setAccounts(prev => {
      const updated = prev.map(acc => 
        acc.platform === platform ? { ...acc, connected: true } : acc
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

  return { accounts, connectAccount, disconnectAccount };
}
