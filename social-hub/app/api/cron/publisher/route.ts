import { NextResponse } from 'next/server';
import prisma from '@/lib/db/index';
import { updatePostStatus } from '@/lib/db/dal';
import { PinterestClient } from '@/lib/platforms/pinterest';
import { MetaClient } from '@/lib/platforms/meta';
import { TikTokClient } from '@/lib/platforms/tiktok';
import { YouTubeClient } from '@/lib/platforms/youtube';

// Netlify Scheduled API Route Config
export const config = {
  schedule: '*/5 * * * *',
};

export async function GET(request: Request) {
  try {
    const now = new Date();
    const queuedPosts = await prisma.contentQueue.findMany({
      where: {
        status: 'queued',
        scheduledTime: { lte: now }
      }
    });

    if (queuedPosts.length === 0) {
      return NextResponse.json({ success: true, message: 'No posts to publish.' });
    }

    const pinterest = new PinterestClient();
    const meta = new MetaClient();
    const tiktok = new TikTokClient();
    const youtube = new YouTubeClient();

    for (const post of queuedPosts) {
      try {
        let result;
        if (post.platform === 'pinterest') {
          result = await pinterest.postPin(
            post.mediaPath || '', 
            post.title || 'Pinterest Pin', 
            `${post.caption} ${post.hashtags || ''}`, 
            'default_board_id', 
            'https://example.com'
          );
        } else if (post.platform === 'meta') {
          result = await meta.postToFacebook(post.mediaPath || '', `${post.caption} ${post.hashtags || ''}`);
        } else if (post.platform === 'tiktok') {
          result = await tiktok.postVideo(post.mediaPath || '', `${post.caption} ${post.hashtags || ''}`);
        } else if (post.platform === 'youtube') {
          result = await youtube.uploadVideo(
            post.mediaPath || '', 
            post.title || 'YouTube Video', 
            `${post.caption} ${post.hashtags || ''}`
          );
        }

        await updatePostStatus(post.id, 'posted', undefined, new Date());
      } catch (error: any) {
        await updatePostStatus(post.id, 'failed', error.message);
      }
    }

    return NextResponse.json({ success: true, publishedCount: queuedPosts.length });
  } catch (err: any) {
    console.error('Publisher Cron Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
