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

// Simulated delay for network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function publishToSocial(request: PublishRequest): Promise<PublishResponse> {
  console.log(`Publishing to ${request.platform}...`, request);
  
  // Simulate API processing time
  await delay(2000);

  // Success simulation
  if (request.content || request.mediaUrl) {
    return {
      success: true,
      postId: `mock_${request.platform}_${Date.now()}`
    };
  }

  return {
    success: false,
    error: 'Content or Media is required'
  };
}

export function getAuthUrl(platform: SocialPlatform): string {
  // In a real app, this would point to the platform's OAuth page
  // For this project, we point to our own callback to simulate success
  return `/api/auth/callback?provider=${platform}`;
}
