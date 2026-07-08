import { NextResponse } from 'next/server';
import prisma from '@/lib/db/index';
import { saveAnalyticsSnapshot } from '@/lib/db/dal';

// Netlify Scheduled API Route Config (runs daily at midnight)
export const config = {
  schedule: '0 0 * * *',
};

export async function GET(request: Request) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const postedContent = await prisma.contentQueue.findMany({
      where: {
        status: 'posted',
        postedAt: { gte: thirtyDaysAgo }
      }
    });

    if (postedContent.length === 0) {
      return NextResponse.json({ success: true, message: 'No recent posts for analytics.' });
    }

    for (const post of postedContent) {
      try {
        let stats: any = {};
        
        // MVP Simulation - In real life, call the platform client's getAnalytics functions
        if (post.platform === 'pinterest') {
          stats = { impressions: Math.floor(Math.random() * 100), saves: 2 }; 
        } else if (post.platform === 'meta') {
          stats = { views: Math.floor(Math.random() * 200), likes: 5 };
        } else if (post.platform === 'tiktok') {
          stats = { views: Math.floor(Math.random() * 1000), likes: 20 };
        } else if (post.platform === 'youtube') {
          stats = { views: Math.floor(Math.random() * 500), likes: 10 };
        }

        await saveAnalyticsSnapshot({
          platform: post.platform,
          postId: post.id,
          date: new Date(),
          views: stats.views || 0,
          impressions: stats.impressions || 0,
          likes: stats.likes || 0,
          comments: stats.comments || 0,
          shares: stats.shares || 0,
          saves: stats.saves || 0,
        });
      } catch (error: any) {
        console.error(`Failed to fetch analytics for post ${post.id}:`, error);
      }
    }

    return NextResponse.json({ success: true, processedCount: postedContent.length });
  } catch (err: any) {
    console.error('Analytics Cron Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
