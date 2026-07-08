import { NextResponse } from 'next/server';
import { TikTokClient } from '@/lib/platforms/tiktok';

export async function GET(request: Request) {
  try {
    const client = new TikTokClient();
    
    // We expect the user to have placed a valid video file here
    const videoPath = 'public/sample-video.mp4';
    const caption = 'Automated test video from Social Hub via API #test';

    // 1. Post Video (Initiate Upload & PUT)
    const postResult = await client.postVideo(videoPath, caption);
    
    // 2. Fetch Publish Status (Immediate status will likely be PROCESSING)
    let statusResult = null;
    try {
      if (postResult.publish_id) {
        statusResult = await client.getVideoAnalytics(postResult.publish_id);
      }
    } catch (e: any) {
      statusResult = { error: 'Status fetch failed', details: e.message };
    }

    return NextResponse.json({
      success: true,
      message: 'TikTok test completed',
      post: postResult,
      status: statusResult,
      reminder: 'Since your app is unaudited, the video was posted as SELF_ONLY. You must manually set it to PUBLIC in the TikTok app.'
    });
  } catch (error: any) {
    console.error('TikTok Test Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
    }, { status: 500 });
  }
}
