import { NextResponse } from 'next/server';
import { getTrendingTopics, analyzeTrend } from '@/lib/social/trends';

export async function GET() {
  try {
    const trends = await getTrendingTopics();
    
    // In a real app, we might analyze all or just return them and let frontend trigger analysis
    // For the "Viral Pulse", let's analyze the top 3
    const analyzedTrends = await Promise.all(
      trends.slice(0, 3).map(trend => analyzeTrend(trend))
    );

    // Combine analyzed with the rest unanalyzed
    const result = [
      ...analyzedTrends,
      ...trends.slice(3)
    ];

    return NextResponse.json({ trends: result });
  } catch (error: any) {
    console.error('Error fetching trends:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
