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

  // Load from local storage if available (simulating persistence)
  useEffect(() => {
    const saved = localStorage.getItem('social_accounts');
    let currentAccounts = accounts;
    if (saved) {
      try {
        currentAccounts = JSON.parse(saved);
        setAccounts(currentAccounts);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    }

    // Handle redirect success
    const connectedProvider = searchParams.get('connected');
    if (connectedProvider) {
      const updated = currentAccounts.map(acc => 
        acc.platform === connectedProvider ? { ...acc, connected: true } : acc
      );
      setAccounts(updated);
      localStorage.setItem('social_accounts', JSON.stringify(updated));
      // Clean up URL
      router.replace('/');
    }
  }, [searchParams, router]);

  const connectAccount = (platform: SocialPlatform) => {
    const updated = accounts.map(acc => 
      acc.platform === platform ? { ...acc, connected: true } : acc
    );
    setAccounts(updated);
    localStorage.setItem('social_accounts', JSON.stringify(updated));
  };

  const disconnectAccount = (platform: SocialPlatform) => {
    const updated = accounts.map(acc => 
      acc.platform === platform ? { ...acc, connected: false } : acc
    );
    setAccounts(updated);
    localStorage.setItem('social_accounts', JSON.stringify(updated));
  };

  return { accounts, connectAccount, disconnectAccount };
}
