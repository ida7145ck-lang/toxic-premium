export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | string;

export interface SocialAccount {
  platform: SocialPlatform;
  username: string;
  connected: boolean;
  avatar?: string;
}

export interface PublishRequest {
  platform: SocialPlatform;
  content: string; // Text or caption
  mediaUrl?: string; // Image or Video URL
  title?: string; // For YouTube
  suggestedMusic?: string; // AI suggested trending audio
}

export interface PublishResponse {
  success: boolean;
  postId?: string;
  error?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PUBLISH TO SOCIAL
 * This function handles the bridge between the UI and real Social APIs.
 * It uses Ayrshare as the primary engine for multi-platform dominance.
 */
export async function publishToSocial(request: PublishRequest): Promise<PublishResponse> {
  console.log(`[Dominance Engine] Publishing to ${request.platform}...`);
  
  const AYRSHARE_API_KEY = process.env.NEXT_PUBLIC_AYRSHARE_API_KEY || process.env.AYRSHARE_API_KEY;

  if (!AYRSHARE_API_KEY || AYRSHARE_API_KEY === 'dummy-key') {
    console.warn(`[Simulation Mode] No Ayrshare API Key found. Simulating success for ${request.platform}.`);
    await delay(1500);
    return {
      success: true,
      postId: `mock_${request.platform}_${Date.now()}`
    };
  }

  try {
    // Mapping our internal platform names to Ayrshare platforms
    const platformMap: Record<string, string> = {
      'facebook': 'facebook',
      'instagram': 'instagram',
      'tiktok': 'tiktok',
      'youtube': 'youtube',
    };

    const targetPlatform = platformMap[request.platform.toLowerCase()] || request.platform.toLowerCase();

    const response = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      },
      body: JSON.stringify({
        post: request.content,
        platforms: [targetPlatform],
        mediaUrls: request.mediaUrl ? [request.mediaUrl] : [],
        title: request.title || 'Toxic Premium Content',
        shortenLinks: true
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        postId: data.id
      };
    } else {
      return {
        success: false,
        error: data.message || 'Platform rejection'
      };
    }
  } catch (error: any) {
    console.error(`[Critical] Failed to post to ${request.platform}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function getAuthUrl(platform: SocialPlatform): string {
  // Direct link to Ayrshare Social Linking page for the premium experience
  return `https://app.ayrshare.com/connect/${platform}`;
}
