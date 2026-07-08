import { NextResponse } from 'next/server';
import { YouTubeClient } from '@/lib/platforms/youtube';

export async function GET(request: Request) {
  try {
    const client = new YouTubeClient();
    
    // Uses the dummy video downloaded previously for TikTok tests
    const videoPath = 'public/sample-video.mp4';
    const title = 'Test YouTube Video from Social Hub API';
    const description = 'This is an automated test video uploaded via the YouTube Data API v3 using the Resumable Upload protocol.\n\nTags: #test #automation #socialhub';
    const tags = ['test', 'automation', 'socialhub', 'api'];

    // 1. Upload Video
    const uploadResult = await client.uploadVideo(videoPath, title, description, tags);
    
    const videoId = uploadResult?.id;
    if (!videoId) {
      return NextResponse.json({ success: false, message: 'Upload completed but no video ID returned', result: uploadResult });
    }

    // 2. Fetch Analytics (Note: analytics are typically delayed by 24-48 hours on YouTube)
    let analyticsResult = null;
    try {
      analyticsResult = await client.getVideoAnalytics(videoId);
    } catch (e: any) {
      analyticsResult = { error: 'Analytics fetch failed (likely because data is not yet available)', details: e.message };
    }

    return NextResponse.json({
      success: true,
      message: 'YouTube test completed successfully',
      video: uploadResult,
      videoId: videoId,
      videoUrl: `https://youtube.com/watch?v=${videoId}`,
      analytics: analyticsResult,
    });
  } catch (error: any) {
    console.error('YouTube Test Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
    }, { status: 500 });
  }
}
